const PROCESSING_MS = 2 * 60 * 60 * 1000
const SHIPPED_MS = 5 * 24 * 60 * 60 * 1000

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered'

export function orderStatus(placedAt: string): OrderStatus {
  const age = Date.now() - Date.parse(placedAt)
  if (age < PROCESSING_MS) return 'Processing'
  if (age < SHIPPED_MS) return 'Shipped'
  return 'Delivered'
}
