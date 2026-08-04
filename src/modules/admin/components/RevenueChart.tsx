import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shared/components/ui'
import type { RevenuePoint } from '../types/dashboard.type'

const CHART_CONFIG = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
  orders: {
    label: 'Orders',
    color: 'var(--chart-2)',
  },
} as const

interface RevenueChartProps {
  data: RevenuePoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <p className="text-sm text-muted-foreground">Daily totals for the selected period</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
            <Area
              dataKey="orders"
              type="monotone"
              stroke="var(--color-orders)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
