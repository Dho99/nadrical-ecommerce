import { Link } from 'react-router-dom'
import { Award, Gift, Heart, Star, Sparkles, Loader2 } from 'lucide-react'
import type { AuthUser } from '../../auth/types/auth.type'
import { Badge, Button, Card, Separator } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import type { ProfileStats } from '../types/profile.type'
import { initialsOf } from '../utils/profile.utils'
import { EditProfileDialog } from './EditProfileDialog'
import { useWishlistCatalog } from '../../wishlist/hooks/useWishlistCatalog'
import { useCustomerVouchers } from '../../voucher'

interface ProfileOverviewProps {
  user: AuthUser
  stats: ProfileStats | null
}

const JOINED_LABEL = new Date(Date.now() - 1000 * 86400 * 90).toLocaleDateString('en-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const JOINED_YEAR = String(new Date(Date.now() - 1000 * 86400 * 90).getFullYear())

export function ProfileOverview({ user, stats }: ProfileOverviewProps) {
  const { products: wishlistProducts, ready: wishlistReady } = useWishlistCatalog()
  const { vouchers, claimableLoyalty, loading: vouchersLoading, claimingId, claim } = useCustomerVouchers()
  const wishlistCount = wishlistProducts.length
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name ?? 'Avatar'} className="size-14 shrink-0 rounded-full border object-cover" />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
              {initialsOf(user.full_name ?? '')}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-2xl font-bold tracking-tight">{user.full_name}</h2>
              <Badge variant={user.role_name === 'admin' ? 'default' : 'secondary'}>
                {user.role_name === 'admin' ? 'Admin' : 'Customer'}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            {user.phone && <p className="truncate font-mono text-sm text-muted-foreground">{user.phone}</p>}
            <p className="mt-1 text-xs text-muted-foreground">Joined since {JOINED_LABEL}</p>
            <div className="mt-3 md:hidden">
              <EditProfileDialog size="xs" />
            </div>
          </div>
        </div>
        <div className="hidden shrink-0 md:block">
          <EditProfileDialog size="sm" />
        </div>
      </div>

      <Separator className="my-3" />

      <dl className="grid grid-cols-3 gap-2 md:gap-6">
        <div>
          <dt className="flex items-center gap-1 font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <Star className="size-3" /> Orders placed
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold tracking-tight">{stats ? stats.orderCount : '—'}</dd>
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
          <dt className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Joined</dt>
          <dd className="mt-1 font-display text-2xl font-bold tracking-tight">{JOINED_YEAR}</dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Gift className="size-4 text-primary" /> Dompet Voucher
            </h3>
            <Badge variant="outline" className="text-[11px]">
              {vouchers.length} Tersedia
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {vouchersLoading
              ? 'Memuat voucher...'
              : vouchers.length > 0
                ? `Anda memiliki ${vouchers.length} voucher aktif di akun Anda`
                : 'Belum ada voucher di akun Anda'}
          </p>

          {/* Active Wallet Vouchers */}
          <ul className="mt-3 space-y-2 text-xs">
            {vouchers.slice(0, 3).map((cv) => {
              const v = cv.voucher
              if (!v) return null
              const isPercent = v.type === 'percent' || v.voucher_type === 'percentage'
              return (
                <li
                  key={cv.uuid || v.code}
                  className="flex items-center justify-between rounded-md border border-dashed border-primary/40 bg-primary/5 px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-primary">{v.code}</span>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {v.description || (isPercent ? `Diskon ${v.discount_value || v.value}%` : `Potongan Rp ${(v.discount_value || v.value)?.toLocaleString()}`)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                    {isPercent ? `${v.discount_value || v.value}% OFF` : 'POTONGAN'}
                  </span>
                </li>
              )
            })}
          </ul>

          {/* Claimable Loyalty Vouchers */}
          {claimableLoyalty.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Sparkles className="size-3.5" /> Voucher Eksklusif Tier Loyalty
              </div>
              <div className="space-y-2">
                {claimableLoyalty.map((cl) => {
                  const v = cl.voucher
                  const isClaiming = claimingId === (v.uuid || v.code)
                  return (
                    <div
                      key={v.uuid || v.code}
                      className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50/50 p-2 text-xs dark:border-amber-900/50 dark:bg-amber-950/20"
                    >
                      <div>
                        <div className="font-mono font-bold text-amber-900 dark:text-amber-200">
                          {v.code}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Tier: {cl.tier_name}
                        </div>
                      </div>
                      {cl.is_claimed ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Sudah Diklaim
                        </Badge>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={isClaiming}
                          onClick={() => claim(v.uuid || v.code)}
                          className="h-7 border-amber-300 text-xs font-medium hover:bg-amber-100 dark:border-amber-800"
                        >
                          {isClaiming ? <Loader2 className="size-3 animate-spin" /> : 'Klaim'}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Heart className="size-4 text-primary" /> Wishlist
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {wishlistReady ? (wishlistCount === 0 ? 'No items saved' : `${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} saved`) : 'Loading wishlist…'}
          </p>
          {wishlistReady ? (
            wishlistCount === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">Tap bookmark on any product to save it here.</p>
            ) : (
              <>
                <ul className="mt-3 flex flex-col gap-2">
                  {wishlistProducts.slice(0, 3).map((p) => (
                    <li key={p.id} className="grid grid-cols-12 items-center gap-2 rounded-md border px-2 py-2">
                      <Link to={`/products/${p.id}`} className="col-span-3 overflow-hidden rounded-md border bg-muted">
                        <ProductImage src={p.cover_image_url} alt={p.name} className="aspect-square w-full" />
                      </Link>
                      <Link to={`/products/${p.id}`} className="col-span-6 min-w-0">
                        <p className="truncate text-xs font-medium hover:underline">{p.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{p.category_id}</p>
                      </Link>
                      <span className="col-span-3 text-right font-mono text-xs font-semibold">×1</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" asChild className="mt-3 w-full">
                  <Link to="/profile/wishlist">View wishlist</Link>
                </Button>
              </>
            )
          ) : null}
        </Card>
      </div>
    </Card>
  )
}
