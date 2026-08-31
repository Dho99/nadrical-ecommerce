import type { CursorPage } from '../../../shared/types/common.type'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'

export const orderService = {
  async listOrders(): Promise<OrderWithItems[]> {
    return orderRepository.list()
  },

  async listOrdersPage(
    cursor: number | null = null,
    limit = 10,
  ): Promise<CursorPage<OrderWithItems>> {
    return orderRepository.listPage(cursor, limit)
  },

  async ensureSeeded(): Promise<OrderWithItems[]> {
    const existing = orderRepository.list()
    if (existing.length > 0) return existing
    return existing
  },

  resetOrders(): void {
    orderRepository.reset()
  },
}