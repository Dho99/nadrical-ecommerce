import api from '../../../shared/lib/api'
import type { DbOrder, DbOrderItem } from '../../../shared/types/database.type'
import { orderRepository } from './order.repository'
import type { OrderConfirmation, OrderPayload } from '../types/checkout.type'

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export const checkoutService = {
  async placeOrder(payload: OrderPayload): Promise<OrderConfirmation> {
    const now = new Date()
    const orderId = makeId('ord')

    // Try calling backend API
    try {
      const itemsInput = payload.items.map((i) => ({
        product_uuid: i.product_id,
        quantity: i.quantity,
      }))

      const res = await api.post('/ecommerce/orders', {
        recipient_name: payload.customer.recipient_name,
        address: `${payload.customer.shipping_address_line_1}${payload.customer.shipping_address_line_2 ? ', ' + payload.customer.shipping_address_line_2 : ''}`,
        phone: payload.customer.recipient_phone,
        email: payload.customer.email,
        postal_code: payload.customer.shipping_postal_code || undefined,
        city: payload.customer.shipping_city,
        shipping_courier: payload.shipping_method,
        shipping_cost: payload.totals.shipping_total,
        service_fee: 0,
        items: itemsInput,
      })

      if (res.data?.data) {
        const orderData = res.data.data
        return {
          order_number: orderData.invoice_number || orderData.order_number || `ORD-${orderData.uuid?.slice(0, 8) || '000'}`,
          placed_at: new Date(orderData.created_at || now),
          email: payload.customer.email,
          eta_days: payload.shipping_method === 'express' ? 1 : 4,
          grand_total: Number(orderData.grand_total || payload.totals.grand_total),
        }
      }
    } catch {
      // Graceful fallback to local repository
    }

    const dbOrder: DbOrder = {
      id: orderId,
      order_number: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: payload.customer.email,
      recipient_name: payload.customer.recipient_name,
      recipient_phone: payload.customer.recipient_phone,
      shipping_address_line_1: payload.customer.shipping_address_line_1,
      shipping_address_line_2: payload.customer.shipping_address_line_2 || undefined,
      shipping_city: payload.customer.shipping_city,
      shipping_province: payload.customer.shipping_province || undefined,
      shipping_postal_code: payload.customer.shipping_postal_code,
      shipping_country_code: payload.customer.shipping_country_code || undefined,
      shipping_method: payload.shipping_method,
      status: 'pending_payment',
      subtotal: payload.totals.subtotal,
      shipping_total: payload.totals.shipping_total,
      grand_total: payload.totals.grand_total,
      placed_at: now.toISOString(),
      created_at: now.toISOString(),
    }

    const dbItems: DbOrderItem[] = payload.items.map((line, idx) => ({
      id: `${orderId}-item-${idx}`,
      order_id: orderId,
      product_id: line.product_id,
      product_name_snapshot: line.product_name,
      sku_snapshot: line.sku,
      variant_name_snapshot: line.variant_name,
      quantity: line.quantity,
      unit_price: line.unit_price,
      line_total: line.unit_price * line.quantity,
      created_at: now.toISOString(),
    }))

    orderRepository.insert(dbOrder, dbItems)

    // Mock payment gateway: auto-confirm shortly after placement.
    setTimeout(() => {
      orderRepository.updateStatus(orderId, {
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
    }, 4000)
    setTimeout(() => {
      orderRepository.updateStatus(orderId, { status: 'processing' })
    }, 9000)

    return {
      order_number: dbOrder.order_number,
      placed_at: now,
      email: dbOrder.user_id ?? '',
      eta_days: payload.shipping_method === 'express' ? 1 : 4,
      grand_total: dbOrder.grand_total,
    }
  },
}
