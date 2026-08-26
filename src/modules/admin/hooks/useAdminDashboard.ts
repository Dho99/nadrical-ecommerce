import { useMemo } from 'react'
import { CATEGORIES } from '../../../shared/constants/product.constants'
import type { Product, ProductCategoryId } from '../../../shared/types/product.type'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { useProducts } from '../../products/hooks/useProducts'
import { useOrders } from './useOrders'
import type { CategorySlice, DashboardPeriod, DashboardStats, RevenuePoint } from '../types/dashboard.type'

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dayLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function latestOrderTime(orders: OrderWithItems[]): number {
  return orders.reduce((max, order) => Math.max(max, Date.parse(order.placed_at ?? '')), 0)
}

function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

export function useAdminDashboard(period: DashboardPeriod) {
  const ordersQuery = useOrders()
  const productsQuery = useProducts({})

  const status = ordersQuery.status === 'error' || productsQuery.status === 'error' ? 'error' : 'loading'
  const ready = ordersQuery.status === 'success' && productsQuery.status === 'success'
  const error = ordersQuery.error ?? productsQuery.error

  const categoryByProductId = useMemo(() => {
    const map = new Map<string, ProductCategoryId>()
    for (const p of productsQuery.products) map.set(p.id, p.category_id)
    return map
  }, [productsQuery.products])

  const stats: DashboardStats | null = useMemo(() => {
    if (!ready) return null
    const now = latestOrderTime(ordersQuery.orders)
    const windowMs = period * DAY_MS
    let revenue = 0
    let order_count = 0
    let prevRevenue = 0
    let prevCount = 0

    for (const order of ordersQuery.orders) {
      const age = now - Date.parse(order.placed_at ?? '')
      if (age <= windowMs) {
        revenue += order.grand_total
        order_count += 1
      } else if (age <= windowMs * 2) {
        prevRevenue += order.grand_total
        prevCount += 1
      }
    }

    const low_stock_count = productsQuery.products.filter((p) => p.stock < 10).length

    return {
      revenue,
      order_count,
      aov: order_count > 0 ? revenue / order_count : 0,
      low_stock_count,
      revenue_delta: percentChange(revenue, prevRevenue),
      order_delta: percentChange(order_count, prevCount),
    }
  }, [ready, period, ordersQuery.orders, productsQuery.products])

  const series: RevenuePoint[] = useMemo(() => {
    if (!ready) return []
    const now = latestOrderTime(ordersQuery.orders)
    const points: RevenuePoint[] = []
    for (let i = period - 1; i >= 0; i--) {
      const start = startOfDay(now - i * DAY_MS)
      let revenue = 0
      let orders = 0
      for (const order of ordersQuery.orders) {
        const ts = Date.parse(order.placed_at ?? '')
        if (ts >= start && ts < start + DAY_MS) {
          revenue += order.grand_total
          orders += 1
        }
      }
      points.push({ date: dayLabel(start), revenue, orders })
    }
    return points
  }, [ready, period, ordersQuery.orders])

  const categoryRevenue: CategorySlice[] = useMemo(() => {
    if (!ready) return []
    const now = latestOrderTime(ordersQuery.orders)
    const windowMs = period * DAY_MS
    const totals = new Map<ProductCategoryId, number>()
    for (const order of ordersQuery.orders) {
      if (now - Date.parse(order.placed_at ?? '') > windowMs) continue
      for (const line of order.order_items) {
        const category_id = categoryByProductId.get(line.product_id)
        if (!category_id) continue
        totals.set(category_id, (totals.get(category_id) ?? 0) + line.unit_price * line.quantity)
      }
    }
    return CATEGORIES.map((cat) => ({ category_id: cat.id, label: cat.label, value: totals.get(cat.id) ?? 0 }))
      .filter((slice) => slice.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [ready, period, ordersQuery.orders, categoryByProductId])

  const recentOrders: OrderWithItems[] = useMemo(() => {
    if (!ready) return []
    return [...ordersQuery.orders]
      .sort((a, b) => Date.parse(b.placed_at ?? '') - Date.parse(a.placed_at ?? ''))
      .slice(0, 8)
  }, [ready, ordersQuery.orders])

  const lowStock: Product[] = useMemo(() => {
    if (!ready) return []
    return [...productsQuery.products]
      .filter((p) => p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6)
  }, [ready, productsQuery.products])

  return { status, error, stats, series, categoryRevenue, recentOrders, lowStock, refetch: () => { ordersQuery.refetch(); productsQuery.refetch() } }
}
