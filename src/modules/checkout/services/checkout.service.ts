import { api, getAuthToken } from '../../../shared/lib/api'
import type { DbOrder, DbOrderItem } from '../../../shared/types/database.type'
import type { OrderConfirmation, OrderPayload } from '../types/checkout.type'

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function mapOrder(order: ApiOrder): DbOrder {
  return {
    id: order.uuid,
    order_number: order.order_number,
    user_id: order.account_uuid,
    recipient_name: order.recipient_name,
    recipient_phone: order.phone,
    shipping_address_line_1: order.address,
    shipping_city: order.city,
    shipping_method: order.shipping_courier,
    status: order.order_status as DbOrder['status'],
    subtotal: order.subtotal,
    shipping_total: order.shipping_cost,
    grand_total: order.total,
    placed_at: order.created_at,
    created_at: order.created_at,
  }
}

interface ApiOrder {
  uuid: string
  order_number: string
  account_uuid: string
  recipient_name: string
  address: string
  phone: string
  city: string
  shipping_courier: string
  order_status: string
  subtotal: number
  shipping_cost: number
  total: number
  created_at: string
}

interface ApiCheckoutResponse {
  order: ApiOrder
}

export const checkoutService = {
  async placeOrder(payload: OrderPayload): Promise<OrderConfirmation> {
    const data = await api.post<ApiCheckoutResponse>('/ecommerce/orders', {
      recipient_name: payload.customer.recipient_name,
      recipient_phone: payload.customer.recipient_phone,
      address: `${payload.customer.shipping_address_line_1} ${payload.customer.shipping_address_line_2 ?? ''}`,
      city: payload.customer.shipping_city,
      postal_code: payload.customer.shipping_postal_code,
      shipping_courier: payload.shipping_method,
      items: payload.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    })
    return {
      order_number: data.order.order_number,
      placed_at: new Date(data.order.created_at),
      email: data.order.account_uuid,
      eta_days: payload.shipping_method === 'express' ? 1 : 4,
      grand_total: data.order.total,
    }
  },
}