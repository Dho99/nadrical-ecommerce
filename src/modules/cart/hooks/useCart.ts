import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductBrief } from '../../../shared/types/product.type'
import type { CartItem } from '../types/cart.type'
import { cartService } from '../services/cart.service'

interface CartStore {
  items: CartItem[]
  add: (product: ProductBrief, qty?: number) => void
  remove: (product_id: string, variant_id?: string) => void
  setQty: (product_id: string, variant_id: string | undefined, quantity: number) => void
  clear: () => void
  qtyOf: (product_id: string, variant_id?: string) => number
}

function matches(item: CartItem, product_id: string, variant_id?: string) {
  return item.product_id === product_id && (item.variant_id ?? undefined) === variant_id
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, qty = 1) => {
        const clamped = Math.min(qty, product.variant_stock ?? product.stock)
        if (clamped <= 0) return
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === product.id && i.variant_id === product.variant_id,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === product.id && i.variant_id === product.variant_id
                  ? { ...i, quantity: Math.min(i.quantity + clamped, i.stock) }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                product_id: product.id,
                sku: product.sku,
                product_name: product.name,
                unit_price: product.base_price,
                quantity: clamped,
                stock: product.variant_stock ?? product.stock,
                cover_image_url: product.cover_image_url,
                category_id: product.category_id,
                variant_id: product.variant_id,
                variant_name: product.variant_name,
              },
            ],
          }
        })
      },

      remove: (product_id, variant_id) =>
        set((state) => ({
          items: state.items.filter((i) => !matches(i, product_id, variant_id)),
        })),
      setQty: (product_id, variant_id, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              matches(i, product_id, variant_id)
                ? { ...i, quantity: Math.min(Math.max(quantity, 1), i.stock) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      qtyOf: (product_id, variant_id) =>
        get().items.find((i) => matches(i, product_id, variant_id))?.quantity ?? 0,
    }),
    { name: 'store-cart-v3' },
  ),
)

export function useCart() {
  const items = useCartStore((s) => s.items)
  const totals = cartService.totals(items)
  const totalQty = cartService.totalQty(items)

  return {
    items,
    totalQty,
    totals,
    add: useCartStore((s) => s.add),
    remove: useCartStore((s) => s.remove),
    setQty: useCartStore((s) => s.setQty),
    clear: useCartStore((s) => s.clear),
    qtyOf: useCartStore((s) => s.qtyOf),
  }
}
