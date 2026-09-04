import api from '../../../shared/lib/api'
import type { DbOrderItem, DbOrderStatus } from '../../../shared/types/database.type'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { orderRepository } from '../../checkout/services/order.repository'
import type { ProfileStats } from '../types/profile.type'

const VALID_ORDER_STATUSES: ReadonlySet<DbOrderStatus> = new Set([
  'pending_payment',
  'WAITING_ONGKIR',
  'WAITING_CONFIRMATION',
  'DELIVERING',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
])

function isDbOrderStatus(value: string): value is DbOrderStatus {
  return VALID_ORDER_STATUSES.has(value as DbOrderStatus)
}

function normalizeOrderStatus(raw: string): DbOrderStatus {
  const lower = raw.toLowerCase()
  if (isDbOrderStatus(lower)) return lower
  if (isDbOrderStatus(raw)) return raw
  return 'pending_payment'
}

interface RawBackendOrder {
  uuid?: string
  id?: string
  order_number?: string
  account_uuid?: string
  user_id?: string
  account?: { email?: string }
  user_address_uuid?: string
  user_address_id?: string
  recipient_name?: string
  phone?: string
  recipient_phone?: string
  address?: string
  shipping_address_line_1?: string
  shipping_address_line_2?: string
  city?: string
  shipping_city?: string
  shipping_province?: string
  postal_code?: string
  shipping_postal_code?: string
  shipping_country_code?: string
  shipping_courier?: string
  shipping_method?: string
  tracking_number?: string
  status?: string
  order_status?: string
  currency_code?: string
  subtotal?: number
  discount_total?: number
  shipping_cost?: number
  shipping_total?: number
  service_fee?: number
  service_fee_total?: number
  tax_total?: number
  total?: number
  grand_total?: number
  paid_at?: string
  placed_at?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  created_at?: string
  updated_at?: string
  order_items?: Array<{
    uuid?: string
    id?: string
    product_uuid?: string
    product_id?: string
    product_name_snapshot?: string
    product?: { name?: string; sku?: string }
    sku_snapshot?: string
    variant_name_snapshot?: string
    quantity?: number
    price?: number
    unit_price?: number
    line_total?: number
    created_at?: string
    updated_at?: string
  }>
}

function mapBackendOrder(bo: RawBackendOrder): OrderWithItems {
  const items: DbOrderItem[] = (bo.order_items || []).map((oi) => ({
    id: oi.uuid || oi.id || '',
    order_id: bo.uuid || bo.id || '',
    product_id: oi.product_uuid || oi.product_id || '',
    product_name_snapshot:
      oi.product_name_snapshot || oi.product?.name || 'Product',
    sku_snapshot: oi.sku_snapshot || oi.product?.sku || undefined,
    variant_name_snapshot: oi.variant_name_snapshot || undefined,
    quantity: Number(oi.quantity || 1),
    unit_price: Number(oi.price || oi.unit_price || 0),
    line_total: Number(
      oi.line_total || Number(oi.price || 0) * Number(oi.quantity || 1),
    ),
    created_at: oi.created_at,
    updated_at: oi.updated_at,
  }))

  let status: string = bo.status || bo.order_status || 'pending_payment'
  if (status === 'WAITING_CONFIRMATION' || status === 'WAITING_ONGKIR') {
    status = 'pending_payment'
  } else if (status === 'PAID') {
    status = 'paid'
  } else if (status === 'DELIVERING') {
    status = 'shipped'
  } else if (status === 'COMPLETED') {
    status = 'completed'
  } else if (status === 'CANCELED') {
    status = 'cancelled'
  }

  return {
    id: bo.uuid || bo.id || '',
    order_number: bo.order_number || `ORD-${bo.uuid?.slice(0, 8) || '000'}`,
    user_id: bo.account_uuid || bo.user_id || bo.account?.email,
    user_address_id: bo.user_address_uuid || bo.user_address_id,
    recipient_name: bo.recipient_name,
    recipient_phone: bo.phone || bo.recipient_phone,
    shipping_address_line_1: bo.address || bo.shipping_address_line_1,
    shipping_address_line_2: bo.shipping_address_line_2,
    shipping_city: bo.city || bo.shipping_city,
    shipping_province: bo.shipping_province,
    shipping_postal_code: bo.postal_code || bo.shipping_postal_code,
    shipping_country_code: bo.shipping_country_code,
    shipping_method: bo.shipping_courier || bo.shipping_method,
    tracking_number: bo.tracking_number,
    status: normalizeOrderStatus(status),
    currency_code: bo.currency_code || 'IDR',
    subtotal: Number(bo.subtotal || 0),
    discount_total: Number(bo.discount_total || 0),
    shipping_total: Number(bo.shipping_cost || bo.shipping_total || 0),
    service_fee_total: Number(bo.service_fee || bo.service_fee_total || 0),
    tax_total: Number(bo.tax_total || 0),
    grand_total: Number(bo.total || bo.grand_total || 0),
    paid_at: bo.paid_at,
    placed_at: bo.placed_at || bo.created_at,
    shipped_at: bo.shipped_at,
    delivered_at: bo.delivered_at,
    cancelled_at: bo.cancelled_at,
    created_at: bo.created_at,
    updated_at: bo.updated_at,
    order_items: items,
  }
}

export const profileService = {
  async getOrderHistory(email?: string): Promise<OrderWithItems[]> {
    try {
      const res = await api.get<{ success: boolean; data: RawBackendOrder[] }>(
        '/ecommerce/orders',
        {
          params: { limit: 50 },
        },
      )
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return res.data.data
          .map(mapBackendOrder)
          .sort(
            (a: OrderWithItems, b: OrderWithItems) =>
              Date.parse(b.placed_at ?? '') -
              Date.parse(a.placed_at ?? ''),
          )
      }
    } catch {
      // fallback
    }

    const all = await orderRepository.list()
    if (!email) return all

    return all
      .filter(
        (o) => (o.user_id ?? '').toLowerCase() === email.toLowerCase(),
      )
      .sort(
        (a: OrderWithItems, b: OrderWithItems) =>
          Date.parse(b.placed_at ?? '') -
          Date.parse(a.placed_at ?? ''),
      )
  },

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
