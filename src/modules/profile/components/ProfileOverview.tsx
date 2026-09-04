import { Award, Gift, Heart, Star } from 'lucide-react'
import type { AuthUser } from '../../auth/types/auth.type'
import { Badge, Card, Separator } from '../../../shared/components/ui'
import type { ProfileStats } from '../types/profile.type'
import { initialsOf } from '../utils/profile.utils'
import { EditProfileDialog } from './EditProfileDialog'

interface ProfileOverviewProps {
  user: AuthUser
  stats: ProfileStats | null
}

const JOINED_LABEL = new Date(Date.now() - 1000 * 86400 * 90).toLocaleDateString('en-ID', {
  month: 'short',
  year: 'numeric',
})
const JOINED_YEAR = String(new Date(Date.now() - 1000 * 86400 * 90).getFullYear())

export function ProfileOverview({ user, stats }: ProfileOverviewProps) {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
            {initialsOf(user.full_name ?? '')}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-2xl font-bold tracking-tight">
                {user.full_name}
              </h2>
              <Badge variant={user.role_name === 'admin' ? 'default' : 'secondary'}>
                {user.role_name === 'admin' ? 'Admin' : 'Customer'}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            {user.phone && (
              <p className="truncate font-mono text-sm text-muted-foreground">{user.phone}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Joined since {JOINED_LABEL}</p>
          </div>
        </div>
        <EditProfileDialog />
      </div>

      <Separator className="my-6" />

      <dl className="grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1 font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <Star className="size-3" /> Orders placed
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold tracking-tight">
            {stats ? stats.orderCount : '—'}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <Award className="size-3" /> Loyalty points
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold tracking-tight">
            {stats ? Math.floor(stats.totalSpent / 10).toLocaleString() : '—'}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Joined
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold tracking-tight">{JOINED_YEAR}</dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Gift className="size-4 text-primary" /> Vouchers
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">You have 2 vouchers</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex items-center justify-between rounded-md border border-dashed px-3 py-2">
              <span className="font-mono font-medium">NADRICAL10</span>
              <span className="text-muted-foreground">10% off</span>
            </li>
            <li className="flex items-center justify-between rounded-md border border-dashed px-3 py-2">
              <span className="font-mono font-medium">FREESHIP</span>
              <span className="text-muted-foreground">Free shipping</span>
            </li>
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Heart className="size-4 text-primary" /> Wishlist
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">3 items saved</p>
          <p className="mt-3 text-xs text-muted-foreground">Tap heart on any product to save it here.</p>
        </Card>
      </div>
    </Card>
  )
}
