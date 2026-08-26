import { mockDelay } from '../../../shared/lib/mock'
import type { CursorPage } from '../../../shared/types/common.type'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'
import { productService } from '../../products/services/product.service'
import { generateSeedOrders } from './order.seed'

export const orderService = {
  async listOrders(): Promise<OrderWithItems[]> {
    await mockDelay(240)
    return orderRepository.list()
  },

  async listOrdersPage(
    cursor: number | null = null,
    limit = 10,
  ): Promise<CursorPage<OrderWithItems>> {
    await mockDelay(220)
    const all = [...orderRepository.list()].sort(
      (a, b) => Date.parse(b.placed_at ?? '') - Date.parse(a.placed_at ?? ''),
    )
    const offset = Math.max(0, cursor ?? 0)
    const total = all.length
    const nextOffset = offset + limit
    return {
      items: all.slice(offset, nextOffset),
      total,
      nextCursor: nextOffset < total ? nextOffset : null,
      prevCursor: offset > 0 ? Math.max(0, offset - limit) : null,
    }
  },

  async ensureSeeded(): Promise<OrderWithItems[]> {
    const existing = orderRepository.list()
    if (existing.length > 0) return existing
    const products = await productService.getProducts()
    const { orders, items } = generateSeedOrders(products)
    orders.forEach((order) => {
      orderRepository.insert(
        order,
        items.filter((item) => item.order_id === order.id),
      )
    })
    return orderRepository.list()
  },

  resetOrders(): void {
    orderRepository.reset()
  },
}
