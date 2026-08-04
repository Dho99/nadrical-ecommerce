import { mockDelay, mockFail } from '../../../shared/lib/mock'
import type { OrderRecord } from '../../../shared/types/order.type'
import { orderRepository } from './order.repository'
import type { OrderConfirmation, OrderPayload } from '../types/checkout.type'

export const checkoutService = {
  async placeOrder(payload: OrderPayload): Promise<OrderConfirmation> {
    await mockDelay(900)
    mockFail(0.02)
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
    const etaDays = payload.shippingMethod === 'express' ? 1 : 4
    const record: OrderRecord = {
      orderNumber,
      placedAt: new Date().toISOString(),
      email: payload.customer.email,
      customerName: payload.customer.fullName,
      shippingMethod: payload.shippingMethod,
      etaDays,
      lines: payload.items.map((item) => ({
        partNumber: item.partNumber,
        name: item.name,
        price: item.price,
        qty: item.qty,
        category: item.category,
        variantName: item.variantName,
      })),
      subtotal: payload.totals.subtotal,
      shipping: payload.totals.shipping,
      total: payload.totals.total,
    }
    orderRepository.insert(record)
    return {
      orderNumber,
      placedAt: new Date(record.placedAt),
      email: record.email,
      etaDays,
      total: record.total,
    }
  },
}
