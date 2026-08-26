import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, Store } from 'lucide-react'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { ADMIN_NAV_ITEMS } from '../../modules/admin/constants/admin.constants'
import { Button } from '../../shared/components/ui'
import { cn } from '../../shared/utils/cn'

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/admin/dashboard"
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center gap-2 border-b px-5"
      >
        <span className="font-display text-xl font-bold tracking-tight">
          Store<span className="text-primary">.</span>
        </span>
        <span className="rounded-sm bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-primary-foreground">
          ADMIN
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin sections">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="shrink-0 border-t p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Store className="size-4" />
          View store
          <ExternalLink className="ml-auto size-3.5" />
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2 rounded-md border px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.full_name}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
