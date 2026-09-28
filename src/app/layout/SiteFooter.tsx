import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES } from '../../modules/products/constants/product.constants'
import { Input, Button } from '../../shared/components/ui'
import { toast } from '../../shared/lib/alert'

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email')
      return
    }
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Thanks for subscribing!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto w-full max-w-7xl grid gap-8 px-5 py-12 sm:px-8 md:grid-cols-4">
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
          <ul className="mt-3 space-y-1">
            <li>
              <Link
                to="/products"
                className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                All products
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              <Link to="/cart" className="transition-colors hover:text-foreground">
                Cart
              </Link>
              {' · '}
              <Link to="/checkout" className="transition-colors hover:text-foreground">
                Checkout
              </Link>
              {' · '}
              <Link to="/login" className="transition-colors hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Contact & Subscribe
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Get the latest news and exclusive offers.</p>
          <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 min-w-0"
              aria-label="Newsletter email"
            />
            <Button type="submit" disabled={loading} aria-label="Subscribe">
              <Mail className="size-4" />
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto w-full max-w-7xl flex flex-wrap items-center justify-between gap-2 px-5 py-4 font-mono text-xs tracking-[0.12em] text-muted-foreground sm:px-8">
          <span>© 2026 Nadrical.</span>
          <span>NADRICAL — CURATED FOR EVERYDAY LIVING</span>
        </div>
      </div>
    </footer>
  )
}
