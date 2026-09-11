import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bookmark,
  LogOut,
  Menu,
  Moon,
  Search,
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

interface NavItemClass {
  active?: boolean;
}

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

  const itemClass = ({ active }: NavItemClass) =>
    cn(
      "whitespace-nowrap px-2 py-1 text-sm transition-colors",
      active
        ? "font-bold text-[#f34e7b]"
        : dark
          ? "font-medium text-white/90 hover:text-[#f34e7b]"
          : "font-medium text-black hover:text-[#f34e7b]",
    );

  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const onProducts = pathname === "/products" && !searchParams.get("category");
  const activeCategory =
    pathname === "/products" ? searchParams.get("category") : null;

  const catalogLinks = (
    <>
      <Link
        to="/products"
        aria-current={onProducts ? "page" : undefined}
        className={itemClass({ active: onProducts })}
      >
        All products
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          to={`/products?category=${cat.id}`}
          aria-current={activeCategory === cat.id ? "page" : undefined}
          className={itemClass({ active: activeCategory === cat.id })}
        >
          {cat.label}
        </Link>
      ))}
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
    <div className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm">
      <span className="text-muted-foreground">Currency</span>
      <div className="ml-auto flex gap-1">
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            className={`rounded px-1.5 py-0.5 text-xs font-medium transition-colors ${
              currencyCode === c
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-accent"
            }`}
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
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
      {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex h-16 items-center gap-4">
          <Link to="/" className="shrink-0">
            <img
              src="/logo.svg"
              alt="Nadrical"
              className="h-7 w-auto dark:hidden"
            />
            <img
              src="/logo-dark.svg"
              alt="Nadrical"
              className="hidden h-7 w-auto dark:block"
            />
          </Link>

          <nav
            aria-label="Catalog"
            className="hidden items-center gap-1 overflow-x-auto lg:flex"
          >
            {catalogLinks}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={handleOpenSearch}
            >
              <Search className="size-5" />
            </Button>

            {isAuthed && <NotificationBell />}

            <Button variant="ghost" size="icon" asChild>
              <Link
                to="/profile/wishlist"
                className="relative"
                aria-label={`Wishlist, ${wishlistCount} items`}
              >
                <Bookmark className="size-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full px-0 text-[10px]">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link
                to="/cart"
                className="relative"
                aria-label={`Cart with ${totalQty} items`}
              >
                <ShoppingCart className="size-5" />
                {totalQty > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full px-0 text-[10px]">
                    {totalQty}
                  </Badge>
                )}
              </Link>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu">
                  <UserRound className="size-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                {isAuthed ? (
                  <>
                    <p className="truncate px-2 py-1.5 text-sm font-medium">
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
                  aria-label="Open menu"
                  className="md:hidden"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
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
                    className="w-full justify-start gap-2"
                    onClick={handleOpenSearch}
                  >
                    <Search /> Search products…
                  </Button>
                </div>
                <nav
                  className="mt-6 flex flex-col gap-1"
                  aria-label="Catalog mobile"
                >
                  {catalogLinks}
                </nav>
                <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                  {isAuthed ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      asChild
                    >
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

        <nav
          aria-label="Catalog secondary"
          className="flex items-center gap-1 overflow-x-auto pb-3 lg:hidden"
        >
          {catalogLinks}
        </nav>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
