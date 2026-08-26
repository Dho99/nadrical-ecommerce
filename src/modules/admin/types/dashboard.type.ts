import type { ProductCategoryId } from '../../../shared/types/product.type'

export type DashboardPeriod = 7 | 30

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

export interface CategorySlice {
  category_id: ProductCategoryId
  label: string
  value: number
}

export interface DashboardStats {
  revenue: number
  order_count: number
  aov: number
  low_stock_count: number
  revenue_delta: number | null
  order_delta: number | null
}
