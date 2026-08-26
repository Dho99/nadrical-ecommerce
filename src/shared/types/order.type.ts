import type { DbOrder, DbOrderItem } from './database.type'

export type OrderDb = DbOrder
export type OrderItemDb = DbOrderItem
export type ShippingMethod = 'standard' | 'express'

export type OrderWithItems = DbOrder & {
  order_items: DbOrderItem[]
}
