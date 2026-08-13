import type { AuthUser } from '../../auth/types/auth.type'
import { Badge, Card, Separator } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import type { ProfileStats } from '../types/profile.type'
import { initialsOf } from '../utils/profile.utils'

interface ProfileOverviewProps {
  user: AuthUser
  stats: ProfileStats | null
}

export function ProfileOverview({ user, stats }: ProfileOverviewProps) {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
          {initialsOf(user.name)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-2xl font-bold tracking-tight">
              {user.name}
            </h2>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
              {user.role === 'admin' ? 'Admin' : 'Customer'}
            </Badge>
          </div>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Separator className="my-6" />

      <dl className="grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Orders placed
          </dt>
          <dd className="mt-1 font-display text-3xl font-bold tracking-tight">
            {stats ? stats.orderCount : '—'}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Total spent
          </dt>
          <dd className="mt-1 font-display text-3xl font-bold tracking-tight">
            {stats ? formatPrice(stats.totalSpent) : '—'}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
