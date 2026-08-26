import type { OrderWithItems } from '../../../shared/types/order.type'
import type { DbOrder, DbOrderItem } from '../../../shared/types/database.type'

const ORDERS_KEY = 'db-orders'
const ORDER_ITEMS_KEY = 'db-order-items'

function loadDb(): { orders: DbOrder[]; items: DbOrderItem[] } {
  try {
    const rawO = localStorage.getItem(ORDERS_KEY)
    if (rawO !== null) {
      const orders = JSON.parse(rawO) as DbOrder[]
      const items = JSON.parse(localStorage.getItem(ORDER_ITEMS_KEY) || '[]') as DbOrderItem[]
      return { orders, items }
    }
  } catch {
    // fall through
  }
  return { orders: [], items: [] }
}

function saveDb(orders: DbOrder[], items: DbOrderItem[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  localStorage.setItem(ORDER_ITEMS_KEY, JSON.stringify(items))
}

export const orderRepository = {
  list(): OrderWithItems[] {
    const db = loadDb()
    return db.orders.map((o) => ({
      ...o,
      order_items: db.items.filter((i) => i.order_id === o.id),
    }))
  },

  insert(order: DbOrder, items: DbOrderItem[]): void {
    const db = loadDb()
    saveDb([...db.orders, order], [...db.items, ...items])
  },

  updateStatus(id: string, patch: Partial<DbOrder>): OrderWithItems | null {
    const db = loadDb()
    const idx = db.orders.findIndex((o) => o.id === id)
    if (idx === -1) return null
    db.orders[idx] = {
      ...db.orders[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    }
    saveDb(db.orders, db.items)
    return {
      ...db.orders[idx],
      order_items: db.items.filter((i) => i.order_id === id),
    }
  },

  get(id: string): OrderWithItems | null {
    return this.list().find((o) => o.id === id) ?? null
  },

  reset(): void {
    saveDb([], [])
  },
}
