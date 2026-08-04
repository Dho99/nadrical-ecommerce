import type { ProductCategoryId } from '../../../shared/types/product.type'

export type DashboardPeriod = 7 | 30

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

export interface CategorySlice {
  category: ProductCategoryId
  label: string
  value: number
}

export interface DashboardStats {
  revenue: number
  orderCount: number
  aov: number
  lowStockCount: number
  revenueDelta: number | null
  orderDelta: number | null
}
