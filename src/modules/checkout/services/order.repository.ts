import api, { unwrapData } from '../../../shared/lib/api'
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
    email: order.email,
    recipient_name: order.recipient_name,
    recipient_phone: order.phone,
    shipping_address_line_1: order.address,
    shipping_city: order.city,
    shipping_method: order.shipping_courier,
    shipping_method_id: order.shipping_method_id,
    status: order.order_status as DbOrder['status'],
    subtotal: Number(order.subtotal ?? 0),
    discount_total: Number(order.discount_total ?? 0),
    shipping_total: Number(order.shipping_cost ?? 0),
    service_fee_total: Number(order.service_fee ?? 0),
    tax_total: Number(order.tax_total ?? 0),
    grand_total: Number(order.total ?? 0),
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
    unit_price: Number(item.price ?? 0),
    line_total: Number(item.line_total ?? item.total ?? (Number(item.price || 0) * item.quantity)),
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

export const orderRepository = {
  async list(): Promise<OrderWithItems[]> {
    const res = await api.get<{ success: boolean; message: string; data?: ApiOrder[]; meta?: { total: number } }>('/ecommerce/orders')
    const list = unwrapData<ApiOrder[]>(res.data as unknown as { success: boolean; message: string; data?: ApiOrder[] }) ?? res.data.data ?? []
    return list.map(toOrderWithItems)
  },

  async listPage(cursor: number | null, limit: number): Promise<{ items: OrderWithItems[]; total: number; nextCursor: number | null; prevCursor: number | null }> {
    const params: Record<string, string> = { limit: String(limit) }
    if (cursor !== null) params.page = String(Math.floor(cursor / limit) + 1)
    const res = await api.get<{ success: boolean; message: string; data?: ApiOrder[]; meta?: { total: number; per_page: number; current_page: number } }>('/ecommerce/orders', { params })
    const list = unwrapData<ApiOrder[]>(res.data as unknown as { success: boolean; message: string; data?: ApiOrder[] }) ?? res.data.data ?? []
    const meta = (res.data as { meta?: { total: number; per_page: number; current_page: number } }).meta
    const total = meta?.total ?? list.length
    const currentPage = meta?.current_page ?? 1
    const perPage = meta?.per_page ?? limit
    const nextCursor = currentPage * perPage < total ? currentPage * perPage : null
    const prevCursor = currentPage > 1 ? (currentPage - 2) * perPage : null
    return { items: list.map(toOrderWithItems), total, nextCursor, prevCursor }
  },

  async get(id: string): Promise<OrderWithItems | null> {
    const res = await api.get<{ success: boolean; message: string; data?: ApiOrder }>('/ecommerce/orders/' + id)
    const order = unwrapData<ApiOrder>(res.data as unknown as { success: boolean; message: string; data?: ApiOrder }) ?? res.data.data
    return order ? toOrderWithItems(order) : null
  },

  async updateStatus(id: string, patch: Partial<DbOrder>): Promise<OrderWithItems | null> {
    const status = patch.status as string
    const normalized = status?.toUpperCase() === 'CANCELLED' ? 'CANCELED' : status?.toUpperCase()
    const res = await api.patch<{ success: boolean; message: string; data?: ApiOrder }>(`/ecommerce/orders/${id}/status`, { status: normalized })
    const order = unwrapData<ApiOrder>(res.data as unknown as { success: boolean; message: string; data?: ApiOrder }) ?? res.data.data
    return order ? toOrderWithItems(order) : null
  },

  async submitPayment(id: string, input: { sender_name: string; sender_bank: string; amount_paid: number; reference_number?: string; payment_date?: string }): Promise<void> {
    await api.post(`/ecommerce/orders/${id}/payments`, {
      sender_name: input.sender_name,
      sender_bank: input.sender_bank,
      amount_paid: input.amount_paid,
      reference_number: input.reference_number || undefined,
      payment_date: input.payment_date || new Date().toISOString(),
    })
  },

  async submitPaymentWithProof(id: string, form: FormData): Promise<void> {
    await api.post(`/ecommerce/orders/${id}/payments`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  async updateShipping(id: string, tracking_number: string, courier?: string): Promise<OrderWithItems | null> {
    const res = await api.patch<{ success: boolean; message: string; data?: ApiOrder }>(`/ecommerce/orders/${id}/shipping`, { tracking_number, shipping_courier: courier })
    const order = unwrapData<ApiOrder>(res.data as unknown as { success: boolean; message: string; data?: ApiOrder }) ?? res.data.data
    return order ? toOrderWithItems(order) : null
  },

  async cancelOrder(_email: string, orderId: string): Promise<void> {
    await api.patch(`/ecommerce/orders/${orderId}/status`, { status: 'CANCELED' })
  },

  async insert(_order: DbOrder, _items: DbOrderItem[]): Promise<void> {
    throw new Error('orderRepository.insert deprecated — gunakan checkoutService.placeOrder')
  },

  async reset(): Promise<void> {
    throw new Error('reset mock tidak tersedia di BE mode')
  },
}
