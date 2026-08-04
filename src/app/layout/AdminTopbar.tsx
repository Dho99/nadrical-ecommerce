import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ExternalLink, Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { adminPageTitle } from '../../modules/admin/constants/admin.constants'
import { Button, Sheet, SheetContent, SheetTitle, SheetTrigger } from '../../shared/components/ui'
import { AdminSidebar } from './AdminSidebar'

export function AdminTopbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const title = adminPageTitle(location.pathname)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-5 backdrop-blur sm:px-8">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Open admin menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin menu</SheetTitle>
          <AdminSidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="truncate font-display text-lg font-bold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
        </Button>
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
          <Link to="/">
            View store <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
