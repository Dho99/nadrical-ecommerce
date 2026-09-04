import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../shared/utils/cn'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    '-mb-px border-b-2 px-1 pb-2 text-sm font-medium transition-colors',
    isActive
      ? 'border-primary text-primary'
      : 'border-transparent text-muted-foreground hover:text-foreground',
  )

export function ProfileLayout() {
  return (
    <div className="container mx-auto px-5 py-10 sm:px-8">
      <header className="mb-6">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Store account
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Profile
        </h1>
      </header>

      <nav aria-label="Account" className="mb-8 flex gap-5 overflow-x-auto border-b">
        <NavLink to="/profile" end className={navLinkClass}>
          Account
        </NavLink>
        <NavLink to="/profile/edit" className={navLinkClass}>
          Edit profile
        </NavLink>
        <NavLink to="/profile/orders" className={navLinkClass}>
          Order history
        </NavLink>
        <NavLink to="/profile/addresses" className={navLinkClass}>
          Addresses
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
