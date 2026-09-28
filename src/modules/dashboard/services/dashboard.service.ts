import api from '../../../shared/lib/api'

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

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await api.get<DashboardSummary>('/ecommerce/dashboard/summary')
    return res.data as unknown as DashboardSummary
  },

  async exportData(params: { type: string; format: string; from?: string; to?: string }): Promise<{ url: string; filename: string }> {
    const res = await api.post<{ url: string; filename: string }>('/ecommerce/dashboard/export', params)
    return res.data as unknown as { url: string; filename: string }
  },
}
