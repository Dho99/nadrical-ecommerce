import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductBrief } from '../../../shared/types/product.type'
import type { CartItem } from '../types/cart.type'
import { cartService } from '../services/cart.service'

interface CartStore {
  items: CartItem[]
  add: (product: ProductBrief, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
  qtyOf: (productId: string) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, qty = 1) => {
        const clamped = Math.min(qty, product.variantStock ?? product.stock)
        if (clamped <= 0) return
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.id && i.variantId === product.variantId,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id && i.variantId === product.variantId
                  ? { ...i, qty: Math.min(i.qty + clamped, i.stock) }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                partNumber: product.partNumber,
                name: product.name,
                price: product.price,
                qty: clamped,
                stock: product.variantStock ?? product.stock,
                imageUrl: product.imageUrl,
                category: product.category,
                variantId: product.variantId,
                variantName: product.variantName,
              },
            ],
          }
        })
      },

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, qty: Math.min(Math.max(qty, 1), i.stock) }
                : i,
            )
            .filter((i) => i.qty > 0),
        })),

      clear: () => set({ items: [] }),

      qtyOf: (productId) => get().items.find((i) => i.productId === productId)?.qty ?? 0,
    }),
    { name: 'store-cart-v2' },
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
