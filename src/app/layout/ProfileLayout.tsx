import { useLocation, useNavigate, Outlet, Link } from 'react-router-dom'
import { Bookmark, LogOut, MapPin, ShieldCheck, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { initialsOf } from '../../modules/profile/utils/profile.utils'
import { Badge, Button, Card, Separator, Tabs, TabsList, TabsTrigger } from '../../shared/components/ui'
import { cn } from '../../shared/utils/cn'

export function ProfileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const pathname = location.pathname

  const activeTab =
    pathname.startsWith('/profile/orders')
      ? '/profile/orders'
      : pathname.startsWith('/profile/addresses')
        ? '/profile/addresses'
        : pathname.startsWith('/profile/wishlist')
          ? '/profile/wishlist'
          : '/profile'

  const handleTabChange = (val: string) => {
    navigate(val)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { value: '/profile', label: 'Account Overview', icon: User },
    { value: '/profile/orders', label: 'Order History', icon: ShoppingBag },
    { value: '/profile/addresses', label: 'Addresses', icon: MapPin },
    { value: '/profile/wishlist', label: 'Wishlist', icon: Bookmark },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          User Dashboard
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Account Settings
        </h1>
      </header>

      {/* Mobile Tab Switcher (no scrollbar) */}
      <div className="mb-6 block md:hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden scrollbar-none bg-muted/60 p-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop & Tablet 2-Column Sidebar Layout */}
      <div className="grid items-start gap-8 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar Left Column */}
        <div className="hidden space-y-4 md:block">
          {/* User Profile Summary Card */}
          {user && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name ?? 'Avatar'}
                    className="size-11 shrink-0 rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                    {initialsOf(user.full_name ?? '')}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold">{user.full_name}</p>
                    {user.role_name === 'admin' && (
                      <Badge variant="default" className="px-1 py-0 text-[10px]">
                        <ShieldCheck className="mr-0.5 size-2.5" /> Admin
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Sidebar Navigation Menu Card */}
          <Card className="p-2">
            <nav className="space-y-1" aria-label="Account sidebar navigation">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.value
                return (
                  <Link
                    key={item.value}
                    to={item.value}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <Separator className="my-2" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Sign out</span>
            </button>
          </Card>
        </div>

        {/* Right Main Content Area */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
