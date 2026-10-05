import { Loader, TrendingUp, ShoppingBag, Users, Package, DollarSign } from 'lucide-react'
import { useDashboardSummary } from '../hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../shared/components/ui'
import { dashboardService } from '../services/dashboard.service'

export function DashboardPage() {
  const { summary, loading, error } = useDashboardSummary()

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <Loader className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <p className="text-sm text-destructive">{error || 'Failed to load dashboard data.'}</p>
        </div>
      </div>
    )
  }

  const handleExport = async (type: string) => {
    try {
      const res = await dashboardService.exportData({ type, format: 'csv' })
      window.open(res.url, '_blank')
    } catch {
      alert('Export failed')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 space-y-8">
      <div>
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Admin</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {summary.total_revenue.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Avg: Rp {summary.avg_order_value.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Orders</CardTitle>
            <ShoppingBag className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_orders}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Customers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_customers}</div>
            <p className="text-xs text-muted-foreground">Unique buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Products</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_products}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>
      </div>

      {summary.revenue_by_date && summary.revenue_by_date.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" /> Revenue (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.revenue_by_date.map((d) => (
                <div key={d.day} className="flex justify-between text-sm">
                  <span>{d.day}</span>
                  <span className="font-mono">Rp {Number(d.revenue).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('orders')}>
            Export Orders CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('customers')}>
            Export Customers CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('products')}>
            Export Products CSV
          </Button>
        </CardContent>
      </Card>

      {summary.top_products && summary.top_products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Products (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.top_products.map((p: Record<string, unknown>) => (
                  <TableRow key={String(p.uuid)}>
                    <TableCell>{String(p.name)}</TableCell>
                    <TableCell>Rp {Number(p.base_price || p.price).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{String(p.stock ?? '')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {summary.recent_orders && summary.recent_orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recent_orders.map((o: Record<string, unknown>) => (
                  <TableRow key={String(o.uuid)}>
                    <TableCell className="font-mono text-xs">{String(o.order_number)}</TableCell>
                    <TableCell>Rp {Number(o.grand_total || o.total).toLocaleString('id-ID')}</TableCell>
                    <TableCell>{String(o.status)}</TableCell>
                    <TableCell>{new Date(String(o.created_at)).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
