import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bookmark, Menu, Moon, Search, ShoppingCart, Sun, UserRound } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCart } from '../../modules/cart/hooks/useCart'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { NotificationBell } from '../../modules/notifications'
import { useWishlist, WishlistDialog } from '../../modules/wishlist'
import { openWishlistDialog } from '../../modules/wishlist/utils/openWishlist'
import { CATEGORIES } from '../../modules/products/constants/product.constants'
import { Badge, Button, Input, Sheet, SheetContent, SheetTitle, SheetTrigger } from '../../shared/components/ui'

export function SiteHeader() {
  const { totalQty } = useCart()
  const { user, isAuthed } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { count: wishlistCount } = useWishlist()

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
    setQuery('')
    setMenuOpen(false)
  }

  const catalogLinks = (
    <>
      <NavLink
        to="/products"
        end
        className={({ isActive }) =>
          `whitespace-nowrap px-2 py-1 text-sm font-medium transition-colors ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`
        }
      >
        All products
      </NavLink>
      {CATEGORIES.map((cat) => (
        <NavLink
          key={cat.id}
          to={`/products?category=${cat.id}`}
          className={({ isActive }) =>
            `whitespace-nowrap px-2 py-1 text-sm font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          {cat.label}
        </NavLink>
      ))}
    </>
  )

  const searchInput = (
    <form onSubmit={onSearch} className="relative w-full" role="search">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="h-9 pl-9"
      />
    </form>
  )

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-5 sm:px-8">
        <div className="flex h-16 items-center gap-4">
          <Link to="/" className="shrink-0">
            <img src="/logo.svg" alt="Nadrical" className="h-7 w-auto dark:hidden" />
            <img src="/logo-dark.svg" alt="Nadrical" className="hidden h-7 w-auto dark:block" />
          </Link>

          <nav
            aria-label="Catalog"
            className="hidden items-center gap-1 overflow-x-auto lg:flex"
          >
            {catalogLinks}
          </nav>

          <div className="hidden w-full max-w-xs md:block">{searchInput}</div>

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

            {isAuthed && <NotificationBell />}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openWishlistDialog()}
              className="relative"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Bookmark />
              <span className="hidden sm:inline">WISHLIST</span>
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full px-0 text-[10px]">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {isAuthed ? (
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/profile" className="max-w-36">
                  <UserRound />
                  <span className="truncate">{user?.full_name}</span>
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/login">
                  <UserRound /> SIGN IN
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/cart"
                className="relative"
                aria-label={`Cart with ${totalQty} items`}
              >
                <ShoppingCart />
                <span className="hidden sm:inline">CART</span>
                {totalQty > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full px-0 text-[10px]">
                    {totalQty}
                  </Badge>
                )}
              </Link>
            </Button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="font-display text-xl font-bold tracking-tight">
                <img src="/logo.svg" alt="Nadrical" className="h-6 w-auto dark:hidden" />
                <img src="/logo-dark.svg" alt="Nadrical" className="hidden h-6 w-auto dark:block" />
              </SheetTitle>
                <div className="mt-4">{searchInput}</div>
                <nav className="mt-6 flex flex-col gap-1" aria-label="Catalog mobile">
                  {catalogLinks}
                </nav>
                <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                  {isAuthed ? (
                    <Button variant="ghost" size="sm" className="justify-start" asChild>
                      <Link to="/profile" onClick={() => setMenuOpen(false)}>
                        <UserRound /> PROFILE
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        <UserRound /> SIGN IN
                      </Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile/tablet category bar — visible below lg, scrollable */}
        <nav
          aria-label="Catalog secondary"
          className="flex items-center gap-1 overflow-x-auto pb-3 lg:hidden"
        >
          {catalogLinks}
        </nav>
      </div>
      <WishlistDialog />
    </header>
  )
}
