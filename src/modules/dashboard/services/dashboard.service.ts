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

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  return [columns.map(esc).join(','), ...rows.map((r) => columns.map((c) => esc(r[c])).join(','))].join('\n')
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return { url, filename }
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

  async exportData(params: { type: string; format: string; from?: string; to?: string }): Promise<{ url: string; filename: string }> {
    try {
      const res = await api.get('/dashboard/export', { params, responseType: 'blob' })
      const disposition = (res.headers as Record<string, string>)?.['content-disposition'] || ''
      const match = /filename="?([^"]+)"?/.exec(disposition)
      const filename = match?.[1] || `export-${params.type}.${params.format === 'csv' ? 'csv' : 'json'}`
      const blob = res.data as Blob
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return { url, filename }
    } catch {
      // Backend export not available -> client-side CSV from summary
    }
    const summary = await dashboardService.getSummary()
    const type = params.type
    let rows: Record<string, unknown>[] = []
    let columns: string[] = []
    if (type === 'orders' && summary.recent_orders) {
      rows = summary.recent_orders as Record<string, unknown>[]
      columns = ['order_number', 'status', 'grand_total', 'created_at']
    } else if (type === 'products' && summary.top_products) {
      rows = summary.top_products as Record<string, unknown>[]
      columns = ['name', 'base_price', 'stock']
    } else if (type === 'customers') {
      rows = [{ total_customers: summary.total_customers, total_orders: summary.total_orders, total_revenue: summary.total_revenue }]
      columns = ['total_customers', 'total_orders', 'total_revenue']
    } else {
      rows = [{ total_revenue: summary.total_revenue, total_orders: summary.total_orders, total_customers: summary.total_customers, total_products: summary.total_products }]
      columns = ['total_revenue', 'total_orders', 'total_customers', 'total_products']
    }
    const csv = toCsv(rows, columns)
    const filename = `export-${type}-${new Date().toISOString().slice(0, 10)}.csv`
    return downloadBlob(csv, filename, 'text/csv;charset=utf-8;')
  },
}
