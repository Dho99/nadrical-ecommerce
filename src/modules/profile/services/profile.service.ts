import { api } from '../../../shared/lib/api'
import { orderRepository } from '../../checkout/services/order.repository'
import type { OrderWithItems } from '../../../shared/types/order.type'
import type { ProfileStats } from '../types/profile.type'

export const profileService = {
  async getOrderHistory(): Promise<OrderWithItems[]> {
    return orderRepository.list()
  },

  async getStats(): Promise<ProfileStats> {
    const orders = await orderRepository.list()
    return {
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.grand_total, 0),
    }
  },

  async cancelOrder(orderId: string): Promise<void> {
    await orderRepository.cancelOrder('', orderId)
  },
}