import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../modules/products/constants/product.constants'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="container mx-auto grid gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <img src="/logo.svg" alt="Nadrical" className="h-7 w-auto dark:hidden" />
          <img src="/logo-dark.svg" alt="Nadrical" className="hidden h-7 w-auto dark:block" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Nadrical — curated essentials across electronics, apparel, home & outdoors. Designed
            for everyday living, shipped within 48 hours.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Shop
          </p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <Link to="/products" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                All products
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Support
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>Ships within 48 hours</li>
            <li>14-day returns, no questions</li>
            <li>2-year guarantee included</li>
            <li className="pt-2">
              <Link to="/cart" className="transition-colors hover:text-foreground">Cart</Link>
              {' · '}
              <Link to="/checkout" className="transition-colors hover:text-foreground">Checkout</Link>
              {' · '}
              <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-5 py-4 font-mono text-xs tracking-[0.12em] text-muted-foreground sm:px-8">
          <span>© 2026 Nadrical.</span>
          <span>NADRICAL — CURATED FOR EVERYDAY LIVING</span>
        </div>
      </div>
    </footer>
  )
}
