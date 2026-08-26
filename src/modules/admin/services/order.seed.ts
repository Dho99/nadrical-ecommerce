import type { DbOrder, DbOrderItem, DbOrderStatus } from '../../../shared/types/database.type'
import type { Product } from '../../../shared/types/product.type'

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = ['Maya', 'Jonas', 'Priya', 'Tom', 'Ava', 'Diego', 'Nina', 'Omar', 'Sara', 'Leo']
const LAST_NAMES = ['Chen', 'Miller', 'Patel', 'Smith', 'Kim', 'Garcia', 'Rossi', 'Haddad', 'Novak', 'Silva']
const CITIES: Array<[string, string]> = [
  ['Jakarta', 'DKI Jakarta'],
  ['Bandung', 'Jawa Barat'],
  ['Surabaya', 'Jawa Timur'],
  ['Yogyakarta', 'DI Yogyakarta'],
  ['Semarang', 'Jawa Tengah'],
]
const DAY_MS = 24 * 60 * 60 * 1000

function resolveStatus(rand: () => number, ageMs: number): DbOrderStatus {
  const r = rand()
  if (ageMs < 2 * 60 * 60 * 1000) {
    return r < 0.55 ? 'pending_payment' : 'paid'
  }
  if (ageMs < 1 * DAY_MS) {
    if (r < 0.12) return 'cancelled'
    return 'processing'
  }
  if (ageMs < 3 * DAY_MS) {
    if (r < 0.06) return 'cancelled'
    if (r < 0.09) return 'processing'
    return 'shipped'
  }
  if (ageMs < 7 * DAY_MS) {
    if (r < 0.08) return 'cancelled'
    if (r < 0.13) return 'refunded'
    if (r < 0.23) return 'shipped'
    return 'completed'
  }
  if (r < 0.07) return 'cancelled'
  if (r < 0.12) return 'refunded'
  return 'completed'
}

export function generateSeedOrders(
  products: Product[],
  count = 130,
): { orders: DbOrder[]; items: DbOrderItem[] } {
  const rand = mulberry32(20260804)
  const now = Date.now()
  const orders: DbOrder[] = []
  const items: DbOrderItem[] = []
  let cursor = now - 90 * DAY_MS

  for (let i = 0; i < count; i++) {
    cursor += (18 + rand() * 26) * 60 * 60 * 1000
    if (cursor > now) break

    const lineCount = rand() < 0.55 ? 1 : rand() < 0.85 ? 2 : 3
    const picked = new Set<number>()
    const orderLines: Array<{ product: Product; quantity: number }> = []
    for (let j = 0; j < lineCount; j++) {
      let idx = Math.floor(rand() * products.length)
      while (picked.has(idx) && picked.size < products.length) {
        idx = Math.floor(rand() * products.length)
      }
      picked.add(idx)
      orderLines.push({ product: products[idx], quantity: 1 + Math.floor(rand() * 3) })
    }

    const subtotal = orderLines.reduce(
      (sum, line) => sum + line.product.base_price * line.quantity,
      0,
    )
    const express = rand() < 0.2
    const shipping_total = express ? 16 : subtotal >= 75 ? 0 : 8
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    const cityIdx = Math.floor(rand() * CITIES.length)
    const [city, province] = CITIES[cityIdx]
    const placed_at = new Date(cursor).toISOString()
    const orderId = `ord-seed-${i}`

    const ageMs = now - cursor
    const status = resolveStatus(rand, ageMs)

    const paid_at =
      status === 'paid' || status === 'processing' || status === 'shipped' || status === 'completed' || status === 'refunded'
        ? new Date(cursor + (300 + rand() * 1800) * 1000).toISOString()
        : undefined

    const shipped_at =
      status === 'shipped' || status === 'completed' || status === 'refunded'
        ? new Date(cursor + (1 + rand() * 3) * DAY_MS).toISOString()
        : undefined

    const delivered_at =
      status === 'completed'
        ? new Date((shipped_at ? Date.parse(shipped_at) : cursor) + (1 + rand() * 2) * DAY_MS).toISOString()
        : undefined

    const cancelled_at =
      status === 'cancelled' || status === 'refunded'
        ? new Date(cursor + (0.5 + rand() * 2) * DAY_MS).toISOString()
        : undefined

    const tracking_number =
      status === 'shipped' || status === 'completed' || status === 'refunded'
        ? `TRK-${String(900000000 + Math.floor(rand() * 99999999)).slice(0, 9)}`
        : undefined

    orders.push({
      id: orderId,
      order_number: `ORD-${String(700000 - i * 137).padStart(6, '0')}`,
      user_id: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      recipient_name: `${firstName} ${lastName}`,
      recipient_phone: '+62 812 0000 0000',
      shipping_address_line_1: 'Jl. Contoh No. 12',
      shipping_city: city,
      shipping_province: province,
      shipping_postal_code: '10110',
      shipping_country_code: 'ID',
      shipping_method: express ? 'express' : 'standard',
      status,
      currency_code: 'USD',
      subtotal,
      shipping_total,
      grand_total: subtotal + shipping_total,
      placed_at,
      paid_at,
      shipped_at,
      delivered_at,
      cancelled_at,
      tracking_number,
      created_at: placed_at,
    })

    orderLines.forEach((line, j) => {
      items.push({
        id: `${orderId}-item-${j}`,
        order_id: orderId,
        product_id: line.product.id,
        sku_snapshot: line.product.sku,
        product_name_snapshot: line.product.name,
        quantity: line.quantity,
        unit_price: line.product.base_price,
        line_total: line.product.base_price * line.quantity,
        created_at: placed_at,
      })
    })
  }

  return { orders, items }
}
