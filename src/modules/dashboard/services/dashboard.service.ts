import api, { unwrapData } from '../../../shared/lib/api'

export interface DashboardSummary {
  total_revenue: number
  total_orders: number
  total_customers: number
  total_products: number
  avg_order_value: number
  top_products?: Record<string, unknown>[]
  recent_orders?: Record<string, unknown>[]
  revenue_by_date?: { day: string; revenue: number }[]
}

export interface DashboardStatsRaw {
  total_users: number
  total_products: number
  total_categories: number
  total_orders: number
  pending_orders: number
  total_revenue: number
  total_news: number
  total_faqs: number
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await api.get<{ success: boolean; message: string; data?: DashboardStatsRaw & DashboardSummary }>('/dashboard/stats')
    const data = unwrapData<DashboardStatsRaw & DashboardSummary>(res.data as unknown as { success: boolean; message: string; data?: DashboardStatsRaw }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to fetch dashboard stats')
    return {
      total_revenue: Number((data as DashboardStatsRaw).total_revenue ?? (data as DashboardSummary).total_revenue ?? 0),
      total_orders: Number((data as DashboardStatsRaw).total_orders ?? (data as DashboardSummary).total_orders ?? 0),
      total_customers: Number((data as DashboardStatsRaw).total_users ?? (data as DashboardSummary).total_customers ?? 0),
      total_products: Number((data as DashboardStatsRaw).total_products ?? (data as DashboardSummary).total_products ?? 0),
      avg_order_value: Number((data as DashboardSummary).avg_order_value ?? 0),
      top_products: (data as DashboardSummary).top_products,
      recent_orders: (data as DashboardSummary).recent_orders,
      revenue_by_date: (data as DashboardSummary).revenue_by_date,
    }
  },

  async exportData(_params: { type: string; format: string; from?: string; to?: string }): Promise<{ url: string; filename: string }> {
    throw new Error('Dashboard export belum tersedia di backend (/dashboard/stats hanya read)')
  },
}
