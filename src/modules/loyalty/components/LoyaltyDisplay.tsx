import { Gift, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../../shared/components/ui'
import { useLoyalty } from '../hooks/useLoyalty'

const TIER_COLORS: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  silver: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
}

function tierColor(name?: string): string {
  const key = (name || '').toLowerCase()
  return TIER_COLORS[key] || 'bg-primary/10 text-primary'
}

export function LoyaltyDisplay() {
  const { points, tier, nextTier, pointsToNext, loading, error } = useLoyalty()

  if (loading) {
    return (
      <div className="animate-pulse space-y-2 rounded-lg border border-border/40 p-3">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-2 text-center text-xs text-muted-foreground">
        Loyalty belum dapat dimuat
      </div>
    )
  }

  return (
    <Card size="sm" className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
            <Gift className="size-4 text-primary" />
            Loyalty Points
          </CardTitle>
          <Badge className={`px-2 py-0.5 text-[10px] font-semibold ${tierColor(tier?.name)}`}>
            {tier?.name || 'Member'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-0">
        <div className="rounded-md border border-border/40 bg-card/80 p-2">
          <p className="text-[10px] text-muted-foreground">Poin saat ini</p>
          <p className="mt-0.5 text-base font-bold text-primary">{points.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-md border border-border/40 bg-card/80 p-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-3.5 shrink-0 text-green-600" />
            <span className="text-[11px] leading-tight text-muted-foreground">
              {nextTier
                ? `${pointsToNext.toLocaleString('id-ID')} poin lagi menuju ${nextTier.name}`
                : 'Level loyalty tertinggi tercapai'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
