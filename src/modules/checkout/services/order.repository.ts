import { api } from '../../../shared/lib/api'
import { resetMockOrders } from '../../../shared/lib/mockApi'
import type { OrderWithItems } from '../../../shared/types/order.type'
import type { DbOrder, DbOrderItem } from '../../../shared/types/database.type'

function toOrderWithItems(order: ApiOrder): OrderWithItems {
  return {
    ...toDbOrder(order),
    order_items: (order.order_items ?? []).map(toDbOrderItem),
  }
}

function toDbOrder(order: ApiOrder): DbOrder {
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

function toDbOrderItem(item: ApiOrderItem): DbOrderItem {
  return {
    id: item.uuid,
    order_id: item.order_uuid,
    product_id: item.product_uuid,
    product_name_snapshot: item.product_name,
    sku_snapshot: item.sku,
    quantity: item.quantity,
    unit_price: Number(item.price),
    line_total: Number(item.total),
    created_at: item.created_at,
    updated_at: item.updated_at,
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
  order_items?: ApiOrderItem[]
}

interface ApiOrderItem {
  uuid: string
  order_uuid: string
  product_uuid: string
  product_name: string
  sku: string
  quantity: number
  price: string
  total: string
  created_at: string
  updated_at: string
}

export const orderRepository = {
  async list(): Promise<OrderWithItems[]> {
    const res = await api.get<{ data?: ApiOrder[]; items?: ApiOrder[]; meta?: { total: number } }>('/ecommerce/orders')
    const list = res.data?.data || res.data?.items || []
    return list.map(toOrderWithItems)
  },

  async listPage(cursor: number | null, limit: number): Promise<{ items: OrderWithItems[]; total: number; nextCursor: number | null; prevCursor: number | null }> {
    const params: Record<string, string> = { limit: String(limit) }
    if (cursor !== null) params.page = String(Math.floor(cursor / limit) + 1)
    const res = await api.get<{ data?: ApiOrder[]; items?: ApiOrder[]; meta?: { total: number; per_page: number; current_page: number } }>('/ecommerce/orders', { params })
    const list = res.data?.data || res.data?.items || []
    const total = res.data?.meta?.total ?? list.length
    const currentPage = res.data?.meta?.current_page ?? 1
    const perPage = res.data?.meta?.per_page ?? limit
    const nextCursor = currentPage * perPage < total ? currentPage * perPage : null
    const prevCursor = currentPage > 1 ? (currentPage - 2) * perPage : null
    return {
      items: list.map(toOrderWithItems),
      total,
      nextCursor,
      prevCursor,
    }
  },

  async insert(order: DbOrder, items: DbOrderItem[]): Promise<void> {
    await api.post('/ecommerce/orders', {
      recipient_name: order.recipient_name,
      phone: order.recipient_phone,
      address: order.shipping_address_line_1,
      city: order.shipping_city,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    })
  },

  async updateStatus(id: string, patch: Partial<DbOrder>): Promise<OrderWithItems | null> {
    const status = patch.status as string
    const res = await api.patch<{ data?: ApiOrder; order?: ApiOrder }>(`/ecommerce/orders/${id}/status`, { status })
    const order = res.data?.data || res.data?.order
    return order ? toOrderWithItems(order) : null
  },

  async get(id: string): Promise<OrderWithItems | null> {
    const res = await api.get<{ data?: ApiOrder; order?: ApiOrder }>(`/ecommerce/orders/${id}`)
    const order = res.data?.data || res.data?.order
    return order ? toOrderWithItems(order) : null
  },

  async cancelOrder(_email: string, orderId: string): Promise<void> {
    await api.patch(`/ecommerce/orders/${orderId}/status`, { status: 'cancelled' })
  },

  async reset(): Promise<void> {
    resetMockOrders()
  },
}