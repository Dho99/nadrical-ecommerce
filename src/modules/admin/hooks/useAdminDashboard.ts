import { useMemo } from 'react'
import { CATEGORIES } from '../../../shared/constants/product.constants'
import type { Product, ProductCategoryId } from '../../../shared/types/product.type'
import type { OrderRecord } from '../../../shared/types/order.type'
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

function latestOrderTime(orders: OrderRecord[]): number {
  return orders.reduce((max, order) => Math.max(max, Date.parse(order.placedAt)), 0)
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

  const stats: DashboardStats | null = useMemo(() => {
    if (!ready) return null
    const now = latestOrderTime(ordersQuery.orders)
    const windowMs = period * DAY_MS
    let revenue = 0
    let orderCount = 0
    let prevRevenue = 0
    let prevCount = 0

    for (const order of ordersQuery.orders) {
      const age = now - Date.parse(order.placedAt)
      if (age <= windowMs) {
        revenue += order.total
        orderCount += 1
      } else if (age <= windowMs * 2) {
        prevRevenue += order.total
        prevCount += 1
      }
    }

    const lowStockCount = productsQuery.products.filter((p) => p.stock < 10).length

    return {
      revenue,
      orderCount,
      aov: orderCount > 0 ? revenue / orderCount : 0,
      lowStockCount,
      revenueDelta: percentChange(revenue, prevRevenue),
      orderDelta: percentChange(orderCount, prevCount),
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
        const ts = Date.parse(order.placedAt)
        if (ts >= start && ts < start + DAY_MS) {
          revenue += order.total
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
      if (now - Date.parse(order.placedAt) > windowMs) continue
      for (const line of order.lines) {
        totals.set(line.category, (totals.get(line.category) ?? 0) + line.price * line.qty)
      }
    }
    return CATEGORIES.map((cat) => ({ category: cat.id, label: cat.label, value: totals.get(cat.id) ?? 0 }))
      .filter((slice) => slice.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [ready, period, ordersQuery.orders])

  const recentOrders: OrderRecord[] = useMemo(() => {
    if (!ready) return []
    return [...ordersQuery.orders]
      .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
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
