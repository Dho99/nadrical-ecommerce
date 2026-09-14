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

const normalizePrice = (val: number | string | undefined): number => {
  const num = Number(val || 0)
  return num >= 1000 ? num / 15800 : num
}

function toDbOrder(order: ApiOrder): DbOrder {
  return {
    id: order.uuid,
    order_number: order.order_number,
    user_id: order.account_uuid,
    email: order.email,
    recipient_name: order.recipient_name,
    recipient_phone: order.phone,
    shipping_address_line_1: order.address,
    shipping_city: order.city,
    shipping_method: order.shipping_courier,
    shipping_method_id: order.shipping_method_id,
    status: order.order_status as DbOrder['status'],
    subtotal: normalizePrice(order.subtotal),
    discount_total: normalizePrice(order.discount_total),
    shipping_total: normalizePrice(order.shipping_cost),
    service_fee_total: normalizePrice(order.service_fee),
    tax_total: normalizePrice(order.tax_total),
    grand_total: normalizePrice(order.total),
    placed_at: order.created_at,
    created_at: order.created_at,
  }
}

function toDbOrderItem(item: ApiOrderItem): DbOrderItem {
  return {
    id: item.uuid,
    order_id: item.order_uuid,
    product_id: item.product_uuid,
    variant_id: item.variant_uuid,
    product_name_snapshot: item.product_name_snapshot || item.product_name || item.product?.name || 'Product',
    sku_snapshot: item.sku_snapshot || item.sku || item.product?.sku || '',
    variant_name_snapshot: item.variant_name_snapshot,
    quantity: item.quantity,
    unit_price: normalizePrice(item.price),
    line_total: normalizePrice(item.line_total ?? item.total ?? (Number(item.price || 0) * item.quantity)),
    image_url: item.product?.image || item.image_url,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}

interface ApiOrder {
  uuid: string
  order_number: string
  account_uuid: string
  email?: string
  recipient_name: string
  address: string
  phone: string
  city: string
  shipping_courier: string
  shipping_method_id?: string
  order_status: string
  subtotal: number
  discount_total?: number
  shipping_cost: number
  service_fee?: number
  tax_total?: number
  total: number
  created_at: string
  order_items?: ApiOrderItem[]
}

interface ApiOrderItem {
  uuid: string
  order_uuid: string
  product_uuid: string
  variant_uuid?: string
  product_name?: string
  product_name_snapshot?: string
  variant_name_snapshot?: string
  product?: { name?: string; sku?: string; image?: string }
  image_url?: string
  sku?: string
  sku_snapshot?: string
  quantity: number
  price: number | string
  total?: number | string
  line_total?: number | string
  created_at: string
  updated_at: string
}

const LOCAL_ORDERS_KEY = 'nadrical_local_orders'

export const orderRepository = {
  async list(): Promise<OrderWithItems[]> {
    let remoteList: OrderWithItems[] = []
    try {
      const res = await api.get<{ data?: ApiOrder[]; items?: ApiOrder[]; meta?: { total: number } }>('/ecommerce/orders')
      const list = res.data?.data || res.data?.items || []
      remoteList = list.map(toOrderWithItems)
    } catch {
      // Remote failed, fallback to local
    }

    try {
      const localOrders: OrderWithItems[] = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]')
      const knownIds = new Set(remoteList.map((o) => o.order_number || o.id))
      const extra = localOrders.filter((o) => !knownIds.has(o.order_number || o.id))
      return [...remoteList, ...extra]
    } catch {
      return remoteList
    }
  },

  async listPage(cursor: number | null, limit: number): Promise<{ items: OrderWithItems[]; total: number; nextCursor: number | null; prevCursor: number | null }> {
    const params: Record<string, string> = { limit: String(limit) }
    if (cursor !== null) params.page = String(Math.floor(cursor / limit) + 1)
    try {
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
    } catch {
      const all = await this.list()
      const start = cursor ?? 0
      const slice = all.slice(start, start + limit)
      return {
        items: slice,
        total: all.length,
        nextCursor: start + limit < all.length ? start + limit : null,
        prevCursor: start > 0 ? Math.max(0, start - limit) : null,
      }
    }
  },

  async insert(order: DbOrder, items: DbOrderItem[]): Promise<void> {
    try {
      await api.post('/ecommerce/orders', {
        recipient_name: order.recipient_name,
        phone: order.recipient_phone,
        address: order.shipping_address_line_1,
        city: order.shipping_city,
        shipping_courier: order.shipping_method || "standard",
        shipping_method_id: order.shipping_method_id || order.shipping_method || "standard",
        shipping_cost: (order.shipping_total || 0) < 500 ? Math.round((order.shipping_total || 0) * 15800) : Math.round(order.shipping_total || 0),
        service_fee: order.service_fee_total || 0,
        items: items.map((i) => ({
          product_uuid: i.product_id,
          quantity: i.quantity,
        })),
      })
    } catch {
      try {
        const stored: OrderWithItems[] = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]')
        stored.unshift({
          ...order,
          order_items: items,
        })
      } catch {
        // ignore localStorage quota or access errors
      }
    }
  },

  async updateStatus(id: string, patch: Partial<DbOrder>): Promise<OrderWithItems | null> {
    const status = patch.status as string
    try {
      const res = await api.patch<{ data?: ApiOrder; order?: ApiOrder }>(`/ecommerce/orders/${id}/status`, { status })
      const order = res.data?.data || res.data?.order
      return order ? toOrderWithItems(order) : null
    } catch {
      return null
    }
  },

  async get(id: string): Promise<OrderWithItems | null> {
    try {
      const res = await api.get<{ data?: ApiOrder; order?: ApiOrder }>(`/ecommerce/orders/${id}`)
      const order = res.data?.data || res.data?.order
      if (order) return toOrderWithItems(order)
    } catch {
      // ignore
    }

    try {
      const localOrders: OrderWithItems[] = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]')
      const found = localOrders.find((o) => o.id === id || o.order_number === id)
      return found || null
    } catch {
      return null
    }
  },

  async cancelOrder(_email: string, orderId: string): Promise<void> {
    await api.patch(`/ecommerce/orders/${orderId}/status`, { status: 'cancelled' })
  },

  async reset(): Promise<void> {
    resetMockOrders()
  },
}