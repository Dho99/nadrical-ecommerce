import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductBrief } from '../../../shared/types/product.type'
import type { CartItem } from '../types/cart.type'
import { cartService } from '../services/cart.service'
import { useAuthStore } from '../../auth/hooks/useAuth'

interface CartStore {
  items: CartItem[]
  hydrated: boolean
  syncing: boolean
  add: (product: ProductBrief, qty?: number) => Promise<void>
  remove: (product_id: string, variant_id?: string) => Promise<void>
  setQty: (product_id: string, variant_id: string | undefined, quantity: number) => Promise<void>
  clear: () => Promise<void>
  qtyOf: (product_id: string, variant_id?: string) => number
  syncFromBackend: () => Promise<void>
  setItems: (items: CartItem[]) => void
}

function matches(item: CartItem, product_id: string, variant_id?: string) {
  return item.product_id === product_id && (item.variant_id ?? undefined) === variant_id
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      syncing: false,

      setItems: (items) => set({ items }),

      syncFromBackend: async () => {
        const token = useAuthStore.getState().session?.token
        if (!token) return
        set({ syncing: true })
        try {
          const remote = await cartService.fetchCart()
          set({ items: remote, hydrated: true })
        } catch {
          // keep local on failure
        } finally {
          set({ syncing: false })
        }
      },

      add: async (product, qty = 1) => {
        const isPreorder = Boolean((product as unknown as { is_preorder?: boolean }).is_preorder)
        const stock = product.variant_stock ?? product.stock
        const clamped = isPreorder ? Math.min(qty, 99) : Math.min(qty, stock)
        if (clamped <= 0) return

        const variantDelta = (product as ProductBrief).variant_price_delta ?? 0
        const baseWithVariant = product.base_price + variantDelta
        const discount = product.discount_percent ?? 0
        const discountedPrice = discount > 0 ? baseWithVariant * (1 - discount / 100) : baseWithVariant

        const prev = get().items
        const optimistic: CartItem[] = (() => {
          const existing = prev.find((i) => i.product_id === product.id && i.variant_id === product.variant_id)
          if (existing) {
            return prev.map((i) =>
              i.product_id === product.id && i.variant_id === product.variant_id
                ? { ...i, quantity: isPreorder ? i.quantity + clamped : Math.min(i.quantity + clamped, i.stock) }
                : i,
            )
          }
          return [
            ...prev,
            {
              product_id: product.id,
              sku: product.sku,
              product_name: product.name,
              unit_price: discountedPrice,
              quantity: clamped,
              stock: product.variant_stock ?? product.stock,
              cover_image_url: product.cover_image_url,
              category_id: product.category_id,
              variant_id: product.variant_id,
              variant_name: product.variant_name,
              is_preorder: isPreorder,
            },
          ]
        })()
        set({ items: optimistic })

        try {
          await cartService.apiAddToCart(product.id, clamped, product.variant_id)
          await get().syncFromBackend()
        } catch {
          set({ items: prev })
          throw new Error('Gagal sync keranjang ke backend')
        }
      },

      remove: async (product_id, variant_id) => {
        const prev = get().items
        const target = prev.find((i) => matches(i, product_id, variant_id))
        set({ items: prev.filter((i) => !matches(i, product_id, variant_id)) })
        if (target?.cart_item_id) {
          try {
            await cartService.apiRemoveItem(target.cart_item_id)
            await get().syncFromBackend()
          } catch {
            set({ items: prev })
          }
        } else {
          try {
            await get().syncFromBackend()
          } catch {
            // ignore
          }
        }
      },

      setQty: async (product_id, variant_id, quantity) => {
        const prev = get().items
        const clampedQty = Math.max(1, quantity)
        set({
          items: prev
            .map((i) =>
              matches(i, product_id, variant_id)
                ? { ...i, quantity: i.is_preorder ? Math.min(clampedQty, 99) : Math.min(clampedQty, i.stock) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })
        const target = prev.find((i) => matches(i, product_id, variant_id))
        if (target?.cart_item_id) {
          try {
            await cartService.apiUpdateItem(target.cart_item_id, clampedQty)
            await get().syncFromBackend()
          } catch {
            set({ items: prev })
          }
        }
      },

      clear: async () => {
        const prev = get().items
        set({ items: [] })
        try {
          await cartService.apiClearCart()
        } catch {
          set({ items: prev })
        }
      },

      qtyOf: (product_id, variant_id) =>
        get().items.find((i) => matches(i, product_id, variant_id))?.quantity ?? 0,
    }),
    { name: 'store-cart-v4' },
  ),
)

export function useCart() {
  const items = useCartStore((s) => s.items)
  const syncing = useCartStore((s) => s.syncing)
  const totals = cartService.totals(items)
  const totalQty = cartService.totalQty(items)

  const syncFromBackend = useCartStore((s) => s.syncFromBackend)

  const session = useAuthStore((s) => s.session)
  useEffect(() => {
    if (session?.token) syncFromBackend()
  }, [session?.token, syncFromBackend])

  const add = useCallback((p: ProductBrief, qty?: number) => useCartStore.getState().add(p, qty), [])
  const remove = useCallback((pid: string, vid?: string) => useCartStore.getState().remove(pid, vid), [])
  const setQty = useCallback((pid: string, vid: string | undefined, q: number) => useCartStore.getState().setQty(pid, vid, q), [])
  const clear = useCallback(() => useCartStore.getState().clear(), [])
  const qtyOf = useCallback((pid: string, vid?: string) => useCartStore.getState().qtyOf(pid, vid), [])

  return { items, totalQty, totals, syncing, add, remove, setQty, clear, qtyOf, syncFromBackend }
}
