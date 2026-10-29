import type { OrderWithItems } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'
import type { ProfileStats } from '../types/profile.type'

export const profileService = {
  async getOrderHistory(email?: string): Promise<OrderWithItems[]> {
    if (!email) return []
    try {
      const orders = await orderRepository.list()
      const target = email.toLowerCase()
      return orders
        .filter((order) => {
          if (order.email && order.email.toLowerCase() === target) return true
          if (order.user_id && order.user_id.toLowerCase() === target) return true
          return !order.email
        })
        .sort(
          (a, b) =>
            Date.parse(b.placed_at ?? b.created_at ?? '') -
            Date.parse(a.placed_at ?? a.created_at ?? ''),
        )
    } catch {
      return []
    }
  },

  async getStats(email: string): Promise<ProfileStats> {
    const orders = await this.getOrderHistory(email)
    return {
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.grand_total, 0),
    }
  },

  async cancelOrder(email: string, orderId: string): Promise<void> {
    void email
    await orderRepository.cancelOrder(email, orderId)
  },
}
