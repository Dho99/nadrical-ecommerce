import type { OrderRecord } from '../../../shared/types/order.type'

const STORAGE_KEY = 'store-orders-v1'

export const orderRepository = {
  list(): OrderRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as OrderRecord[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // fall through to empty
    }
    return []
  },

  insert(order: OrderRecord): OrderRecord[] {
    const next = [...this.list(), order]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
