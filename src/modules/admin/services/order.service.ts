import { mockDelay } from '../../../shared/lib/mock'
import type { CursorPage } from '../../../shared/types/common.type'
import type { OrderRecord } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'
import { productService } from '../../products/services/product.service'
import { generateSeedOrders } from './order.seed'

export const orderService = {
  async listOrders(): Promise<OrderRecord[]> {
    await mockDelay(240)
    return orderRepository.list()
  },

  async listOrdersPage(
    cursor: number | null = null,
    limit = 10,
  ): Promise<CursorPage<OrderRecord>> {
    await mockDelay(220)
    const all = [...orderRepository.list()].sort(
      (a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt),
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

  async ensureSeeded(): Promise<OrderRecord[]> {
    const existing = orderRepository.list()
    if (existing.length > 0) return existing
    const products = await productService.getProducts()
    const seeded = generateSeedOrders(products)
    for (const order of seeded) {
      orderRepository.insert(order)
    }
    return orderRepository.list()
  },

  resetOrders(): void {
    orderRepository.reset()
  },
}
