import type { WishlistItem } from '../types/wishlist.type'

const STORAGE_KEY = 'wishlist-v1'

export const wishlistService = {
  list(): WishlistItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as WishlistItem[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // ignore corrupt storage
    }
    return []
  },

  save(items: WishlistItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  },

  isWished(productId: string): boolean {
    return this.list().some((item) => item.product_id === productId)
  },

  toggle(productId: string): { wished: boolean } {
    const items = this.list()
    const exists = items.some((item) => item.product_id === productId)
    const next = exists
      ? items.filter((item) => item.product_id !== productId)
      : [...items, { product_id: productId, added_at: new Date().toISOString() }]
    this.save(next)
    return { wished: !exists }
  },

  clear(): void {
    this.save([])
  },
}
