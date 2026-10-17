import { Gift, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../../shared/components/ui'
import { useLoyalty } from '../hooks/useLoyalty'

export function LoyaltyDisplay() {
  const { account, loading, error } = useLoyalty()

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-2 text-center text-xs text-muted-foreground">
        Loyalty belum dapat dimuat
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border border-border/40 p-3 animate-pulse">
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!account) return null

  const tierColors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    silver: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
    platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  }

  const tierLabels: Record<string, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
  }

  return (
    <Card size="sm" className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
            <Gift className="size-4 text-primary" />
            Loyalty Points
          </CardTitle>
          <Badge className={`text-[10px] font-semibold px-2 py-0.5 ${tierColors[account.current_tier]}`}>
            {tierLabels[account.current_tier]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-card/80 border border-border/40 p-2">
            <p className="text-[10px] text-muted-foreground">Current Points</p>
            <p className="mt-0.5 text-base font-bold text-primary">{account.current_points.toLocaleString()}</p>
          </div>
          <div className="rounded-md bg-card/80 border border-border/40 p-2">
            <p className="text-[10px] text-muted-foreground">Total Earned</p>
            <p className="mt-0.5 text-sm font-semibold">{account.total_earned.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-md bg-card/80 border border-border/40 p-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-green-600 shrink-0" />
            <span className="text-[11px] text-muted-foreground leading-tight">
              Earn {getTierPercentage(account.current_tier)}% per purchase
            </span>
          </div>
        </div>
        {account.points_expire_at && (
          <p className="text-[10px] text-amber-600">
            ⚠️ Exp: {new Date(account.points_expire_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function getTierPercentage(tier: string): number {
  const rates: Record<string, number> = { bronze: 1, silver: 2, gold: 3, platinum: 5 }
  return rates[tier] ?? 1
}
