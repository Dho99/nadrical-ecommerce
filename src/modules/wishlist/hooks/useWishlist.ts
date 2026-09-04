import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wishlistService } from '../services/wishlist.service'
import type { WishlistItem } from '../types/wishlist.type'

interface WishlistState {
  items: WishlistItem[]
  toggle: (productId: string) => boolean
  remove: (productId: string) => void
  clear: () => void
  has: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: wishlistService.list(),

      toggle: (productId) => {
        const { wished } = wishlistService.toggle(productId)
        set({ items: wishlistService.list() })
        return wished
      },

      remove: (productId) => {
        wishlistService.save(get().items.filter((i) => i.product_id !== productId))
        set({ items: wishlistService.list() })
      },

      clear: () => {
        wishlistService.clear()
        set({ items: [] })
      },

      has: (productId) => get().items.some((i) => i.product_id === productId),
    }),
    { name: 'store-wishlist' },
  ),
)

export function useWishlist() {
  const items = useWishlistStore((s) => s.items)
  return {
    items,
    ids: items.map((i) => i.product_id),
    count: items.length,
    has: useWishlistStore((s) => s.has),
    toggle: useWishlistStore((s) => s.toggle),
    remove: useWishlistStore((s) => s.remove),
    clear: useWishlistStore((s) => s.clear),
  }
}
