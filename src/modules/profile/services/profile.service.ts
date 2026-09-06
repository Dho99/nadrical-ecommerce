import api from '../../../shared/lib/api'
import type { DbOrder, DbOrderItem } from '../../../shared/types/database.type'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'
import { generateUserOrders } from '../../orders/services/user-order.seed'
import type { ProfileStats } from '../types/profile.type'

function toOrderWithItems(orders: DbOrder[], items: DbOrderItem[]): OrderWithItems[] {
  const grouped = new Map<string, DbOrderItem[]>()
  for (const it of items) {
    const arr = grouped.get(it.order_id) ?? []
    arr.push(it)
    grouped.set(it.order_id, arr)
  }
  return orders.map((o) => ({
    ...o,
    order_items: grouped.get(o.id) ?? [],
  }))
}

export const profileService = {
  async getOrderHistory(email?: string): Promise<OrderWithItems[]> {
    // Mock-first: seeded demo orders always render even when backend is offline.
    const byEmail = (o: { user_id?: string }): boolean =>
      !email || (o.user_id ?? '').toLowerCase() === email.toLowerCase()

    const seeds = email ? generateUserOrders(email) : { orders: [], items: [] as DbOrderItem[] }
    const seeded = toOrderWithItems(seeds.orders, seeds.items).filter(byEmail)

    let local: OrderWithItems[] = []
    try {
      local = await orderRepository.list()
    } catch {
      // Backend offline — ignore, seeded mock data still shows.
    }

    return [...seeded, ...local]
      .filter(byEmail)
      .sort(
        (a: OrderWithItems, b: OrderWithItems) =>
          Date.parse(b.placed_at ?? '') - Date.parse(a.placed_at ?? ''),
      )
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for API parity with seed helper
  async ensureUserSeeded(_email: string): Promise<void> {
    // No-op helper for mock seeding
  },

  async getStats(email: string): Promise<ProfileStats> {
    const orders = await this.getOrderHistory(email)
    return {
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.grand_total, 0),
    }
  },

  async cancelOrder(_email: string, orderId: string): Promise<void> {
    try {
      await api.patch(`/ecommerce/orders/${orderId}/status`, {
        status: 'CANCELED',
      })
    } catch {
      // fallback
    }

    try {
      const order = await orderRepository.get(orderId)
      if (order) {
        await orderRepository.updateStatus(orderId, {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
      }
    } catch {
      // ignore
    }
  },
}
