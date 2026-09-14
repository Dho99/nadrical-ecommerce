import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bookmark,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCart } from "../../modules/cart/hooks/useCart";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { NotificationBell } from "../../modules/notifications";
import { useWishlist } from "../../modules/wishlist";
import {
  useCurrency,
  CURRENCIES,
  type CurrencyCode,
} from "../../modules/currency";
import { CATEGORIES } from "../../modules/products/constants/product.constants";
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../../shared/components/ui";
import { SearchDialog } from "./SearchDialog";
import { cn } from "../../shared/utils/cn";

export function SiteHeader() {
  const { totalQty } = useCart();
  const { user, isAuthed, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();
  const { code: currencyCode, set: setCurrency } = useCurrency();

  const dark = resolvedTheme === "dark";

  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const onProducts = pathname === "/products" && !searchParams.get("category");
  const activeCategory =
    pathname === "/products" ? searchParams.get("category") : null;

  const getItemClass = (active: boolean) =>
    cn(
      "whitespace-nowrap px-2.5 py-1 text-sm transition-colors font-medium",
      active
        ? "font-bold text-[#f34e7b]"
        : dark
          ? "text-white/90 hover:text-[#f34e7b]"
          : "text-foreground hover:text-[#f34e7b]",
    );

  const catalogDesktopLinks = (
    <>
      <Link
        to="/products"
        aria-current={onProducts ? "page" : undefined}
        className={getItemClass(onProducts)}
      >
        All products
      </Link>
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <Link
            key={cat.id}
            to={`/products?category=${cat.id}`}
            aria-current={isActive ? "page" : undefined}
            className={getItemClass(isActive)}
          >
            {cat.label}
          </Link>
        );
      })}
    </>
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  const currencySwitch = (
    <div className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm">
      <span className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Currency</span>
      <div className="flex gap-1">
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            className={cn(
              "rounded px-2 py-1 text-xs font-semibold transition-colors",
              currencyCode === c
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );

  const themeToggle = (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4 text-slate-700" />
      )}
      <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Nadrical"
              width={111}
              height={28}
              className="h-7 w-auto dark:hidden"
            />
            <img
              src="/logo-dark.svg"
              alt="Nadrical"
              width={111}
              height={28}
              className="hidden h-7 w-auto dark:block"
            />
          </Link>

          <nav
            aria-label="Catalog Desktop"
            className="hidden items-center gap-1 overflow-x-auto lg:flex"
          >
            {catalogDesktopLinks}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={handleOpenSearch}
              className="size-9 sm:size-10"
            >
              <Search className="size-5" />
            </Button>

            {isAuthed && <NotificationBell />}

            <Button variant="ghost" size="icon" className="size-9 sm:size-10" asChild>
              <Link
                to="/profile/wishlist"
                className="relative"
                aria-label={`Wishlist, ${wishlistCount} items`}
              >
                <Bookmark className="size-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px]">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="size-9 sm:size-10" asChild>
              <Link
                to="/cart"
                className="relative"
                aria-label={`Cart with ${totalQty} items`}
              >
                <ShoppingCart className="size-5" />
                {totalQty > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px]">
                    {totalQty}
                  </Badge>
                )}
              </Link>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex size-10" aria-label="User menu">
                  <UserRound className="size-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                {isAuthed ? (
                  <>
                    <p className="truncate px-2 py-1 text-sm font-bold">
                      {user?.full_name}
                    </p>
                    <p className="truncate px-2 pb-2 text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <Separator />
                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <UserRound className="size-4" /> Profile
                    </Link>
                    <Link
                      to="/profile/orders"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <ShoppingBag className="size-4" /> Order history
                    </Link>
                    <Link
                      to="/profile/wishlist"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <Bookmark className="size-4" /> Wishlist
                    </Link>
                    <Separator className="my-1" />
                    {themeToggle}
                    {currencySwitch}
                    <Separator className="my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                    >
                      <LogOut className="size-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    {themeToggle}
                    {currencySwitch}
                    <Separator className="my-1" />
                    <Link
                      to="/login"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
                    >
                      <UserRound className="size-4" /> Sign in
                    </Link>
                  </>
                )}
              </PopoverContent>
            </Popover>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open mobile navigation menu"
                  className="lg:hidden size-9 sm:size-10"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col w-80 p-0 sm:max-w-xs">
                <div className="p-5 border-b">
                  <SheetTitle className="font-display text-xl font-bold tracking-tight">
                    <img
                      src="/logo.svg"
                      alt="Nadrical"
                      className="h-6 w-auto dark:hidden"
                    />
                    <img
                      src="/logo-dark.svg"
                      alt="Nadrical"
                      className="hidden h-6 w-auto dark:block"
                    />
                  </SheetTitle>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-sm text-muted-foreground"
                      onClick={handleOpenSearch}
                    >
                      <Search className="size-4" /> Search products…
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3">
                    Categories
                  </p>
                  <nav className="flex flex-col gap-1" aria-label="Catalog mobile">
                    <Link
                      to="/products"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        onProducts
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-accent text-foreground",
                      )}
                    >
                      <span>All Products</span>
                    </Link>
                    {CATEGORIES.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      return (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.id}`}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground font-bold"
                              : "hover:bg-accent text-foreground",
                          )}
                        >
                          <span>{cat.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  <Separator className="my-5" />

                  <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-3">
                    Account
                  </p>
                  {isAuthed ? (
                    <div className="flex flex-col gap-1">
                      <div className="px-3 py-2 rounded-lg bg-muted/50 mb-2">
                        <p className="text-sm font-bold truncate">{user?.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      >
                        <UserRound className="size-4" /> Account Settings
                      </Link>
                      <Link
                        to="/profile/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      >
                        <ShoppingBag className="size-4" /> Order History
                      </Link>
                      <Link
                        to="/profile/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                      >
                        <Bookmark className="size-4" /> Wishlist
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="size-4" /> Sign out
                      </button>
                    </div>
                  ) : (
                    <Button asChild className="w-full">
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        <UserRound className="mr-2 size-4" /> Sign in
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="p-4 border-t bg-muted/20 space-y-2">
                  {themeToggle}
                  {currencySwitch}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
