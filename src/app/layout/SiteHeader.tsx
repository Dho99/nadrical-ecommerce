import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Moon, Search, ShoppingCart, Sun, UserRound } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCart } from '../../modules/cart/hooks/useCart'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { CATEGORIES } from '../../modules/products/constants/product.constants'
import { Badge, Button, Input, Sheet, SheetContent, SheetTitle, SheetTrigger } from '../../shared/components/ui'

export function SiteHeader() {
  const { totalQty } = useCart()
  const { user, isAuthed, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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
          <Link to="/" className="shrink-0 font-display text-2xl font-bold tracking-tight">
            Store<span className="text-primary">.</span>
          </Link>

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

            {isAuthed ? (
              <div className="hidden items-center gap-2 md:flex">
                <span className="max-w-28 truncate text-sm text-muted-foreground">{user?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  <LogOut /> OUT
                </Button>
              </div>
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
                  Store<span className="text-primary">.</span>
                </SheetTitle>
                <div className="mt-4">{searchInput}</div>
                <nav className="mt-6 flex flex-col gap-1" aria-label="Catalog mobile">
                  {catalogLinks}
                </nav>
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  {isAuthed ? (
                    <>
                      <span className="truncate text-sm text-muted-foreground">{user?.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          logout()
                          setMenuOpen(false)
                          navigate('/')
                        }}
                      >
                        <LogOut /> OUT
                      </Button>
                    </>
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

        <nav aria-label="Catalog" className="hidden items-center gap-1 overflow-x-auto pb-3 lg:flex">
          {catalogLinks}
        </nav>
      </div>
    </header>
  )
}
