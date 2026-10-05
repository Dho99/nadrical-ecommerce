import api, { getErrorMessage, unwrapData } from '../../../shared/lib/api'
import type { OrderConfirmation, OrderPayload } from '../types/checkout.type'
import { shippingService } from './shipping.service'
import { productService } from '../../products/services/product.service'

export const checkoutService = {
  async placeOrder(payload: OrderPayload): Promise<OrderConfirmation> {
    const now = new Date()
    const etaDays = shippingService.etaDays(payload.shipping_method)

    const itemsInput = payload.items.map((i) => ({
      product_uuid: i.product_id,
      variant_uuid: i.variant_id || undefined,
      quantity: i.quantity,
    }))

    const body = {
      recipient_name: payload.customer.recipient_name,
      address: `${payload.customer.shipping_address_line_1}${payload.customer.shipping_address_line_2 ? ', ' + payload.customer.shipping_address_line_2 : ''}`.trim(),
      shipping_address: payload.customer.shipping_address_line_1,
      phone: payload.customer.recipient_phone,
      phone_number: payload.customer.recipient_phone,
      email: payload.customer.email,
      postal_code: payload.customer.shipping_postal_code || undefined,
      shipping_postal_code: payload.customer.shipping_postal_code || undefined,
      city: payload.customer.shipping_city,
      shipping_city: payload.customer.shipping_city,
      shipping_courier: payload.shipping_method,
      shipping_method: payload.shipping_method,
      shipping_cost: Math.round(payload.totals.shipping_total),
      discount: Math.round(payload.totals.discount ?? 0),
      voucher_code: payload.voucher_code || payload.totals.voucher_code || undefined,
      service_fee: Math.round(payload.totals.payment_fee ?? 0),
      items: itemsInput,
    }

    try {
      const res = await api.post<{ success: boolean; message: string; data?: Record<string, unknown> }>('/ecommerce/orders', body)
      const data = unwrapData<Record<string, unknown>>(res.data as unknown as { success: boolean; message: string; data?: Record<string, unknown> }) ?? res.data.data
      const orderData = (data && 'order' in (data as Record<string, unknown>) ? (data as Record<string, unknown>).order : data) as Record<string, unknown> | undefined
      const orderNumber = typeof orderData?.order_number === 'string' ? (orderData.order_number as string) : typeof data?.order_number === 'string' ? (data.order_number as string) : undefined
      if (orderNumber) {
        productService.clearCache()
        const createdAt = typeof orderData?.created_at === 'string' ? (orderData.created_at as string) : typeof data?.created_at === 'string' ? (data.created_at as string) : undefined
        const totalRaw = (orderData?.total ?? data?.total) as unknown
        return {
          order_number: orderNumber,
          placed_at: new Date(createdAt ?? now.toISOString()),
          email: payload.customer.email,
          eta_days: etaDays,
          grand_total: typeof totalRaw === 'number' || typeof totalRaw === 'string' ? Number(totalRaw) : payload.totals.grand_total,
        }
      }
      throw new Error(res.data.message || 'Gagal membuat order')
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, 'Gagal memproses pesanan'), { cause: err })
    }
  },
}
