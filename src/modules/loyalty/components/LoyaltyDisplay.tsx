import { Gift, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../../shared/components/ui'
import { useLoyalty } from '../hooks/useLoyalty'

export function LoyaltyDisplay() {
  const { account, loading } = useLoyalty()

  if (loading || !account) return null

  const tierColors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-800',
    silver: 'bg-slate-100 text-slate-800',
    gold: 'bg-yellow-100 text-yellow-800',
    platinum: 'bg-purple-100 text-purple-800',
  }

  const tierLabels: Record<string, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="size-5 text-primary" />
            Loyalty Points
          </CardTitle>
          <Badge className={tierColors[account.current_tier]}>
            {tierLabels[account.current_tier]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-card p-3">
            <p className="text-xs text-muted-foreground">Current Points</p>
            <p className="mt-1 text-2xl font-bold text-primary">{account.current_points.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-card p-3">
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="mt-1 text-lg font-semibold">{account.total_earned.toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-lg bg-card p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-sm text-muted-foreground">You earn {getTierPercentage(account.current_tier)}% per purchase</span>
          </div>
        </div>
        {account.points_expire_at && (
          <p className="text-xs text-amber-600">
            ⚠️ Points expire on {new Date(account.points_expire_at).toLocaleDateString()}
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
