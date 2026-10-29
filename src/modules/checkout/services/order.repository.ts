import api, { getAuthToken, unwrapData } from '../../../shared/lib/api'
import type { OrderWithItems } from '../../../shared/types/order.type'
import type { DbOrder, DbOrderItem, DbPayment } from '../../../shared/types/database.type'
import { normalizeOrderStatus } from '../../../shared/utils/order-status'

function toOrderWithItems(order: ApiOrder): OrderWithItems {
  return {
    ...toDbOrder(order),
    order_items: (order.order_items ?? []).map(toDbOrderItem),
  }
}

interface ApiPayment {
  uuid?: string
  id?: string
  order_uuid?: string
  payment_method?: string
  payment_channel?: string
  sender_name?: string
  payer_name?: string
  sender_bank?: string
  payer_bank?: string
  reference_number?: string
  amount?: number
  status?: string
  payment_proof_url?: string
  rejection_reason?: string
  verified_at?: string
  paid_at?: string
  created_at?: string
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
    shipping_address_line_2: order.shipping_address_line_2,
    shipping_city: order.city,
    shipping_province: order.shipping_province,
    shipping_postal_code: order.postal_code,
    shipping_country_code: order.shipping_country_code,
    shipping_courier: order.shipping_courier,
    shipping_method: order.shipping_courier,
    shipping_method_id: order.shipping_method_id,
    tracking_number: order.tracking_number,
    status: normalizeOrderStatus(order.order_status),
    subtotal: Number(order.subtotal ?? 0),
    discount_total: Number(order.discount_total ?? 0),
    shipping_total: Number(order.shipping_cost ?? 0),
    service_fee_total: Number(order.service_fee ?? 0),
    tax_total: Number(order.tax_total ?? 0),
    grand_total: Number(order.total ?? 0),
    currency_code: order.currency_code,
    paid_at: order.paid_at,
    placed_at: order.placed_at ?? order.created_at,
    shipped_at: order.shipped_at,
    delivered_at: order.delivered_at,
    cancelled_at: order.cancelled_at,
    notes: order.notes,
    created_at: order.created_at,
    updated_at: order.updated_at,
    payment: order.payment
      ? {
          id: order.payment.uuid || order.payment.id || '',
          order_id: order.uuid,
          payment_method: order.payment.payment_method,
          payment_channel: order.payment.payment_channel,
          payer_name: order.payment.sender_name || order.payment.payer_name,
          payer_bank: order.payment.sender_bank || order.payment.payer_bank,
          sender_name: order.payment.sender_name || order.payment.payer_name,
          sender_bank: order.payment.sender_bank || order.payment.payer_bank,
          reference_number: order.payment.reference_number,
          amount: Number(order.payment.amount ?? 0),
          status: (order.payment.status as DbPayment['status']) || 'pending',
          payment_proof_url: order.payment.payment_proof_url,
          rejection_reason: order.payment.rejection_reason,
          verified_at: order.payment.verified_at,
          paid_at: order.payment.paid_at,
          created_at: order.payment.created_at,
        }
      : undefined,
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

export interface ApiOrder {
  uuid: string
  order_number: string
  account_uuid: string
  email?: string
  recipient_name: string
  address: string
  shipping_address_line_2?: string
  phone: string
  city: string
  shipping_province?: string
  postal_code?: string
  shipping_country_code?: string
  shipping_courier: string
  shipping_method_id?: string
  tracking_number?: string
  order_status: string
  subtotal: number
  discount_total?: number
  shipping_cost: number
  service_fee?: number
  tax_total?: number
  total: number
  currency_code?: string
  paid_at?: string
  placed_at?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  notes?: string
  created_at: string
  updated_at?: string
  order_items?: ApiOrderItem[]
  payment?: ApiPayment
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
    if (!getAuthToken()) return []
    const all: ApiOrder[] = []
    let page = 1
    while (page <= 20) {
      const res = await api.get<{ success: boolean; message: string; data?: ApiOrder[]; meta?: { total: number; per_page: number; current_page: number } }>('/ecommerce/orders', {
        params: { page, limit: 100, scope: 'my' },
      })
      const list = unwrapData<ApiOrder[]>(res.data as unknown as { success: boolean; message: string; data?: ApiOrder[] }) ?? res.data.data ?? []
      all.push(...list)
      const meta = (res.data as { meta?: { total: number; per_page: number; current_page: number } }).meta
      const total = meta?.total ?? all.length
      if (list.length < 100 || all.length >= total) break
      page += 1
    }
    return all.map(toOrderWithItems)
  },

  async listPage(cursor: number | null, limit: number): Promise<{ items: OrderWithItems[]; total: number; nextCursor: number | null; prevCursor: number | null }> {
    if (!getAuthToken()) return { items: [], total: 0, nextCursor: null, prevCursor: null }
    const params: Record<string, string> = { limit: String(limit), scope: 'my' }
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
    if (!getAuthToken()) return null
    const res = await api.get<{ success: boolean; message: string; data?: ApiOrder }>('/ecommerce/orders/' + id, {
      params: { scope: 'my' },
    })
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
    await api.post(`/ecommerce/orders/${id}/payments`, form)
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
    void _order
    void _items
    throw new Error('orderRepository.insert deprecated — gunakan checkoutService.placeOrder')
  },

  async fetchPaymentMethods(): Promise<GatewayPaymentMethod[]> {
    const res = await api.get<{ success: boolean; message: string; data?: GatewayPaymentMethod[] }>('/ecommerce/payment-methods?is_enabled=true')
    return unwrapData<GatewayPaymentMethod[]>(res.data as unknown as { success: boolean; message: string; data?: GatewayPaymentMethod[] }) ?? res.data.data ?? []
  },

  async fetchShippingMethods(): Promise<GatewayShippingMethod[]> {
    const res = await api.get<{ success: boolean; message: string; data?: GatewayShippingMethod[] }>('/ecommerce/shipping-methods?is_enabled=true')
    return unwrapData<GatewayShippingMethod[]>(res.data as unknown as { success: boolean; message: string; data?: GatewayShippingMethod[] }) ?? res.data.data ?? []
  },

  async reset(): Promise<void> {
    throw new Error('reset mock tidak tersedia di BE mode')
  },
}

export interface GatewayPaymentMethod {
  uuid: string
  gateway_code: string
  code: string
  name: string
  category: string
  logo_url?: string
  is_enabled: boolean
  fee_type: 'FIXED' | 'PERCENTAGE'
  additional_fee: number
  default_gateway_fee: number
  bank_name?: string
  account_number?: string
  account_holder?: string
  account_holder_name?: string
  instructions?: string
}

export interface GatewayShippingMethod {
  uuid: string
  gateway_code: string
  courier_code: string
  courier_name: string
  service_code: string
  service_name: string
  full_name: string
  logo_url?: string
  base_rate: number
  fee_type: 'FIXED' | 'PERCENTAGE'
  additional_fee: number
  etd?: string
  is_enabled: boolean
}

