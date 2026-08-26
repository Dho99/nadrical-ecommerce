import { mockDelay } from '../../../shared/lib/mock'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'
import type { ProfileStats } from '../types/profile.type'
import { generateUserOrders } from './user-order.seed'

export const profileService = {
  async ensureUserSeeded(email: string): Promise<void> {
    const existing = orderRepository
      .list()
      .filter((o) => (o.user_id ?? '').toLowerCase() === email.toLowerCase())
    if (existing.length > 0) return
    const { orders, items } = generateUserOrders(email)
    orders.forEach((o) => {
      orderRepository.insert(o, items.filter((i) => i.order_id === o.id))
    })
  },

  async getOrderHistory(email: string): Promise<OrderWithItems[]> {
    await mockDelay(260)
    return orderRepository
      .list()
      .filter((o) => (o.user_id ?? '').toLowerCase() === email.toLowerCase())
      .sort((a, b) => Date.parse(b.placed_at ?? '') - Date.parse(a.placed_at ?? ''))
  },

  async getStats(email: string): Promise<ProfileStats> {
    await mockDelay(200)
    const orders = orderRepository
      .list()
      .filter((o) => (o.user_id ?? '').toLowerCase() === email.toLowerCase())
    return {
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.grand_total, 0),
    }
  },

  async cancelOrder(email: string, orderId: string): Promise<void> {
    await mockDelay(300)
    const order = orderRepository.get(orderId)
    if (!order || (order.user_id ?? '').toLowerCase() !== email.toLowerCase()) {
      throw new Error('Order not found')
    }
    if (order.status !== 'pending_payment' && order.status !== 'paid') {
      throw new Error('This order can no longer be cancelled')
    }
    orderRepository.updateStatus(orderId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
  },
}
