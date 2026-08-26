import { useState } from 'react'
import { Banknote, DollarSign, Receipt, TriangleAlert } from 'lucide-react'
import {
  AnnouncementComposer,
  CategoryRevenue,
  LowStockList,
  RecentOrdersTable,
  RevenueChart,
  StatCard,
  useAdminDashboard,
} from '../../modules/admin'
import type { DashboardPeriod } from '../../modules/admin/types/dashboard.type'
import { formatPrice } from '../../shared/utils/format'
import { EmptyState, Skeleton, Tabs, TabsList, TabsTrigger } from '../../shared/components/ui'

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>(30)
  const { status, error, stats, series, categoryRevenue, recentOrders, lowStock } =
    useAdminDashboard(period)

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Store admin · Overview
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Dashboard
          </h1>
        </div>
        <Tabs
          value={String(period)}
          onValueChange={(value) => setPeriod(Number(value) as DashboardPeriod)}
        >
          <TabsList>
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {status === 'loading' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      )}

      {status === 'error' && (
        <EmptyState
          title="Could not load dashboard"
          description={error ?? 'Something went wrong.'}
        />
      )}

      {status === 'success' && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              value={formatPrice(stats.revenue)}
              icon={DollarSign}
              delta={stats.revenue_delta}
            />
            <StatCard
              label="Orders"
              value={String(stats.order_count)}
              icon={Receipt}
              delta={stats.order_delta}
            />
            <StatCard label="Avg order value" value={formatPrice(stats.aov)} icon={Banknote} />
            <StatCard
              label="Low stock"
              value={String(stats.low_stock_count)}
              icon={TriangleAlert}
            />
          </div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <RevenueChart data={series} />
            <CategoryRevenue data={categoryRevenue} />
          </div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <RecentOrdersTable orders={recentOrders} />
            <LowStockList products={lowStock} />
          </div>

          <div className="mt-4">
            <AnnouncementComposer />
          </div>
        </>
      )}
    </div>
  )
}
