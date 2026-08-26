import { Cell, Pie, PieChart } from 'recharts'
import { formatPrice } from '../../../shared/utils/format'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../shared/components/ui'
import type { CategorySlice } from '../types/dashboard.type'

const CHART_CONFIG = {
  category: {
    label: 'Revenue by category',
    color: 'var(--chart-1)',
  },
} as const

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface CategoryRevenueProps {
  data: CategorySlice[]
}

export function CategoryRevenue({ data }: CategoryRevenueProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-10 text-center text-sm text-muted-foreground">
            No orders in this period yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by category</CardTitle>
        <p className="text-sm text-muted-foreground">Share of sales in the selected period</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((slice, index) => (
                <Cell key={slice.category_id} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="mt-4 space-y-2">
          {data.map((slice, index) => (
            <li key={slice.category_id} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{slice.label}</span>
              <span className="ml-auto font-mono text-xs font-semibold">
                {formatPrice(slice.value)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
