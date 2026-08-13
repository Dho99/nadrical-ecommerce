import { mockDelay } from '../../../shared/lib/mock'
import type { OrderRecord } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'
import type { ProfileStats } from '../types/profile.type'

export const profileService = {
  async getOrderHistory(email: string): Promise<OrderRecord[]> {
    await mockDelay(260)
    return orderRepository
      .list()
      .filter((o) => o.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
  },

  async getStats(email: string): Promise<ProfileStats> {
    await mockDelay(200)
    const orders = orderRepository
      .list()
      .filter((o) => o.email.toLowerCase() === email.toLowerCase())
    return {
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    }
  },
}
