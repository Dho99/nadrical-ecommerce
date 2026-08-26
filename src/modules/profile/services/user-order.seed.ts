import type { DbOrder, DbOrderItem } from '../../../shared/types/database.type'

const DAY_MS = 86_400_000

interface SeedLine {
  product_id: string
  sku: string
  name: string
  price: number
  quantity: number
  variant_id?: string
  variant_name?: string
}

interface SeedOrder {
  order_number: string
  age_ms: number
  status: DbOrder['status']
  shipping_method: 'standard' | 'express'
  lines: SeedLine[]
  paid_at_offset?: number
  shipped_at_offset?: number
  delivered_at_offset?: number
  cancelled_at_offset?: number
  tracking_number?: string
}

const SEED: SeedOrder[] = [
  {
    order_number: 'ORD-100001',
    age_ms: 45 * 60_000,
    status: 'pending_payment',
    shipping_method: 'standard',
    lines: [{ product_id: 'SKU-1001', sku: 'SKU-1001', name: 'Wireless Over-Ear Headphones', price: 149, quantity: 1 }],
  },
  {
    order_number: 'ORD-100002',
    age_ms: 2 * 3600_000,
    status: 'pending_payment',
    shipping_method: 'standard',
    lines: [
      { product_id: 'SKU-3001', sku: 'SKU-3001', name: 'Three-Seater Fabric Sofa', price: 899, quantity: 1 },
      { product_id: 'SKU-4002', sku: 'SKU-4002', name: 'Polarized Aviator Sunglasses', price: 68, quantity: 1 },
    ],
  },
  {
    order_number: 'ORD-100003',
    age_ms: 6 * 3600_000,
    status: 'paid',
    shipping_method: 'express',
    paid_at_offset: 30 * 60_000,
    lines: [{ product_id: 'SKU-2001', sku: 'SKU-2001', name: 'Crew Neck Cotton Tee', price: 24, quantity: 2 }],
  },
  {
    order_number: 'ORD-100004',
    age_ms: 18 * 3600_000,
    status: 'processing',
    shipping_method: 'standard',
    paid_at_offset: 40 * 60_000,
    lines: [
      { product_id: 'SKU-1002', sku: 'SKU-1002', name: 'Minimal Smart Watch 42mm', price: 229, quantity: 1 },
      { product_id: 'SKU-5001', sku: 'SKU-5001', name: '4-Person Camping Tent', price: 219, quantity: 1 },
    ],
  },
  {
    order_number: 'ORD-100005',
    age_ms: 1 * DAY_MS,
    status: 'processing',
    shipping_method: 'express',
    paid_at_offset: 35 * 60_000,
    lines: [{ product_id: 'SKU-2002', sku: 'SKU-2002', name: 'Fleece-Lined Hoodie', price: 59, quantity: 1, variant_id: 'SKU-2002-S-MER', variant_name: 'S / Merah' }],
  },
  {
    order_number: 'ORD-100006',
    age_ms: 3 * DAY_MS,
    status: 'shipped',
    shipping_method: 'standard',
    paid_at_offset: 50 * 60_000,
    shipped_at_offset: 1.5 * DAY_MS,
    tracking_number: 'TRK-900182736',
    lines: [{ product_id: 'SKU-3001', sku: 'SKU-3001', name: 'Three-Seater Fabric Sofa', price: 899, quantity: 1 }],
  },
  {
    order_number: 'ORD-100007',
    age_ms: 4 * DAY_MS,
    status: 'shipped',
    shipping_method: 'express',
    paid_at_offset: 20 * 60_000,
    shipped_at_offset: 1 * DAY_MS,
    tracking_number: 'TRK-900473821',
    lines: [
      { product_id: 'SKU-1001', sku: 'SKU-1001', name: 'Wireless Over-Ear Headphones', price: 149, quantity: 1 },
      { product_id: 'SKU-4001', sku: 'SKU-4001', name: 'Laptop Backpack 28L', price: 79, quantity: 1 },
    ],
  },
  {
    order_number: 'ORD-100008',
    age_ms: 8 * DAY_MS,
    status: 'completed',
    shipping_method: 'standard',
    paid_at_offset: 45 * 60_000,
    shipped_at_offset: 2 * DAY_MS,
    delivered_at_offset: 6 * DAY_MS,
    lines: [{ product_id: 'SKU-2001', sku: 'SKU-2001', name: 'Crew Neck Cotton Tee', price: 24, quantity: 3 }],
  },
  {
    order_number: 'ORD-100009',
    age_ms: 15 * DAY_MS,
    status: 'completed',
    shipping_method: 'standard',
    paid_at_offset: 30 * 60_000,
    shipped_at_offset: 2.5 * DAY_MS,
    delivered_at_offset: 10 * DAY_MS,
    lines: [
      { product_id: 'SKU-1002', sku: 'SKU-1002', name: 'Minimal Smart Watch 42mm', price: 229, quantity: 1 },
      { product_id: 'SKU-2002', sku: 'SKU-2002', name: 'Fleece-Lined Hoodie', price: 59, quantity: 1, variant_id: 'SKU-2002-M-HIJ', variant_name: 'M / Hijau' },
    ],
  },
  {
    order_number: 'ORD-100010',
    age_ms: 22 * DAY_MS,
    status: 'completed',
    shipping_method: 'express',
    paid_at_offset: 25 * 60_000,
    shipped_at_offset: 1 * DAY_MS,
    delivered_at_offset: 18 * DAY_MS,
    tracking_number: 'TRK-900736184',
    lines: [
      { product_id: 'SKU-5001', sku: 'SKU-5001', name: '4-Person Camping Tent', price: 219, quantity: 1 },
      { product_id: 'SKU-5002', sku: 'SKU-5002', name: 'Insulated Steel Bottle 750ml', price: 32, quantity: 2, variant_id: 'SKU-5002-BLK', variant_name: 'Black' },
    ],
  },
  {
    order_number: 'ORD-100011',
    age_ms: 35 * DAY_MS,
    status: 'completed',
    shipping_method: 'standard',
    paid_at_offset: 55 * 60_000,
    shipped_at_offset: 3 * DAY_MS,
    delivered_at_offset: 28 * DAY_MS,
    lines: [
      { product_id: 'SKU-3001', sku: 'SKU-3001', name: 'Three-Seater Fabric Sofa', price: 899, quantity: 1 },
      { product_id: 'SKU-4002', sku: 'SKU-4002', name: 'Polarized Aviator Sunglasses', price: 68, quantity: 2 },
    ],
  },
  {
    order_number: 'ORD-100012',
    age_ms: 12 * DAY_MS,
    status: 'cancelled',
    shipping_method: 'standard',
    cancelled_at_offset: 0.5 * DAY_MS,
    lines: [{ product_id: 'SKU-1001', sku: 'SKU-1001', name: 'Wireless Over-Ear Headphones', price: 149, quantity: 1 }],
  },
  {
    order_number: 'ORD-100013',
    age_ms: 28 * DAY_MS,
    status: 'cancelled',
    shipping_method: 'express',
    cancelled_at_offset: 1 * DAY_MS,
    lines: [{ product_id: 'SKU-2002', sku: 'SKU-2002', name: 'Fleece-Lined Hoodie', price: 59, quantity: 1, variant_id: 'SKU-2002-L-HIJ', variant_name: 'L / Hijau' }],
  },
  {
    order_number: 'ORD-100014',
    age_ms: 40 * DAY_MS,
    status: 'refunded',
    shipping_method: 'standard',
    paid_at_offset: 40 * 60_000,
    shipped_at_offset: 2 * DAY_MS,
    delivered_at_offset: 12 * DAY_MS,
    cancelled_at_offset: 30 * DAY_MS,
    lines: [
      { product_id: 'SKU-3001', sku: 'SKU-3001', name: 'Three-Seater Fabric Sofa', price: 899, quantity: 1 },
      { product_id: 'SKU-5001', sku: 'SKU-5001', name: '4-Person Camping Tent', price: 219, quantity: 1 },
    ],
  },
  {
    order_number: 'ORD-100015',
    age_ms: 50 * DAY_MS,
    status: 'refunded',
    shipping_method: 'standard',
    paid_at_offset: 35 * 60_000,
    shipped_at_offset: 2.5 * DAY_MS,
    delivered_at_offset: 15 * DAY_MS,
    cancelled_at_offset: 35 * DAY_MS,
    lines: [{ product_id: 'SKU-1002', sku: 'SKU-1002', name: 'Minimal Smart Watch 42mm', price: 229, quantity: 1 }],
  },
]

export function generateUserOrders(email: string): {
  orders: DbOrder[]
  items: DbOrderItem[]
} {
  const now = Date.now()
  const orders: DbOrder[] = []
  const items: DbOrderItem[] = []

  for (let i = 0; i < SEED.length; i++) {
    const s = SEED[i]
    const placed_at = new Date(now - s.age_ms).toISOString()
    const orderId = `usr-order-${i}`
    const subtotal = s.lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
    const express = s.shipping_method === 'express'
    const shipping_total = express ? 16 : subtotal >= 75 ? 0 : 8

    orders.push({
      id: orderId,
      order_number: s.order_number,
      user_id: email,
      recipient_name: 'Demo User',
      recipient_phone: '+62 812 3456 7890',
      shipping_address_line_1: 'Jl. Sudirman No. 45',
      shipping_city: 'Jakarta',
      shipping_province: 'DKI Jakarta',
      shipping_postal_code: '10110',
      shipping_country_code: 'ID',
      shipping_method: s.shipping_method,
      status: s.status,
      currency_code: 'USD',
      subtotal,
      shipping_total,
      grand_total: subtotal + shipping_total,
      placed_at,
      created_at: placed_at,
      paid_at: s.paid_at_offset != null ? new Date(now - s.age_ms + s.paid_at_offset).toISOString() : undefined,
      shipped_at: s.shipped_at_offset != null ? new Date(now - s.age_ms + s.shipped_at_offset).toISOString() : undefined,
      delivered_at: s.delivered_at_offset != null ? new Date(now - s.age_ms + s.delivered_at_offset).toISOString() : undefined,
      cancelled_at: s.cancelled_at_offset != null ? new Date(now - s.age_ms + s.cancelled_at_offset).toISOString() : undefined,
      tracking_number: s.tracking_number,
    })

    s.lines.forEach((line, j) => {
      items.push({
        id: `${orderId}-item-${j}`,
        order_id: orderId,
        product_id: line.product_id,
        sku_snapshot: line.sku,
        product_name_snapshot: line.name,
        quantity: line.quantity,
        unit_price: line.price,
        line_total: line.price * line.quantity,
        variant_name_snapshot: line.variant_name,
        created_at: placed_at,
      })
    })
  }

  return { orders, items }
}
