import type { OrderRecord } from '../../../shared/types/order.type'
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

const DAY_MS = 24 * 60 * 60 * 1000

export function generateSeedOrders(products: Product[], count = 130): OrderRecord[] {
  const rand = mulberry32(20260804)
  const now = Date.now()
  const orders: OrderRecord[] = []
  let cursor = now - 90 * DAY_MS

  for (let i = 0; i < count; i++) {
    cursor += (18 + rand() * 26) * 60 * 60 * 1000
    if (cursor > now) break

    const lineCount = rand() < 0.55 ? 1 : rand() < 0.85 ? 2 : 3
    const picked = new Set<number>()
    const lines: OrderRecord['lines'] = []
    for (let j = 0; j < lineCount; j++) {
      let idx = Math.floor(rand() * products.length)
      while (picked.has(idx) && picked.size < products.length) {
        idx = Math.floor(rand() * products.length)
      }
      picked.add(idx)
      const product = products[idx]
      lines.push({
        partNumber: product.partNumber,
        name: product.name,
        price: product.price,
        qty: 1 + Math.floor(rand() * 3),
        category: product.category,
      })
    }

    const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0)
    const express = rand() < 0.2
    const shipping = express ? 16 : subtotal >= 75 ? 0 : 8
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]

    orders.push({
      orderNumber: `ORD-${String(700000 - i * 137).padStart(6, '0')}`,
      placedAt: new Date(cursor).toISOString(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      customerName: `${firstName} ${lastName}`,
      shippingMethod: express ? 'express' : 'standard',
      etaDays: express ? 1 : 4,
      lines,
      subtotal,
      shipping,
      total: subtotal + shipping,
    })
  }

  return orders
}
