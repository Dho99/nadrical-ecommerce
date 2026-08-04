import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: number | null
}

export function StatCard({ label, value, icon: Icon, delta }: StatCardProps) {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta)
  const up = (delta ?? 0) >= 0

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
          {hasDelta && (
            <p
              className={cn(
                'mt-1.5 flex items-center gap-1 text-xs font-medium',
                up ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
              )}
            >
              {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {Math.abs(delta as number).toFixed(1)}%
              <span className="font-normal text-muted-foreground">vs previous period</span>
            </p>
          )}
        </div>
        <div className="rounded-lg border bg-muted p-2 text-muted-foreground">
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}
