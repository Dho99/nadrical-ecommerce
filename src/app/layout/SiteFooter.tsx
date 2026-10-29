import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { useCategories } from '../../modules/products/hooks/useCategories'
import { Input, Button } from '../../shared/components/ui'
import { toast } from '../../shared/lib/alert'
import { useLogo, useLogoConfig, useContactInfo, useSiteTagline } from '../../modules/home/hooks/useBanner'

function logoVars(mobile: number, desktop: number): CSSProperties {
  return {
    '--logo-foot-h-mobile': `${mobile}px`,
    '--logo-foot-h-desktop': `${desktop}px`,
  } as CSSProperties
}

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { logo: dynamicLogo } = useLogo()
  const { config: logoConfig } = useLogoConfig()
  const { email: contactEmail, phone: contactPhone, address: contactAddress } = useContactInfo()
  const { tagline } = useSiteTagline()
  const categories = useCategories()

  const handleSubscribe = (e: React.FormEvent) => {
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
      toast.info('Newsletter belum tersedia di backend saat ini.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto w-full max-w-7xl grid gap-8 px-5 py-12 sm:px-8 md:grid-cols-4">
        <div>
          {dynamicLogo ? (
            <img
              src={dynamicLogo}
              alt="Nadrical"
              style={logoVars(logoConfig.footerMobileHeightPx || 32, logoConfig.footerDesktopHeightPx || 44)}
              className="h-[var(--logo-foot-h-mobile)] sm:h-[var(--logo-foot-h-desktop)] w-auto object-contain transition-all"
            />
          ) : (
            <>
              <img
                src="/logo.svg"
                alt="Nadrical"
                style={logoVars(logoConfig.footerMobileHeightPx || 32, logoConfig.footerDesktopHeightPx || 44)}
                className="h-[var(--logo-foot-h-mobile)] sm:h-[var(--logo-foot-h-desktop)] w-auto dark:hidden transition-all"
              />
              <img
                src="/logo-dark.svg"
                alt="Nadrical"
                style={logoVars(logoConfig.footerMobileHeightPx || 32, logoConfig.footerDesktopHeightPx || 44)}
                className="hidden h-[var(--logo-foot-h-mobile)] sm:h-[var(--logo-foot-h-desktop)] w-auto dark:block transition-all"
              />
            </>
          )}
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {tagline ||
              'Nadrical — curated essentials across electronics, apparel, home & outdoors. Designed for everyday living, shipped within 48 hours.'}
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
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/news"
                className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                News & Journal
              </Link>
            </li>
            <li>
              <Link
                to="/announcements"
                className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Pengumuman
              </Link>
            </li>
            <li>
              <Link
                to="/reviews"
                className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Ulasan Pelanggan
              </Link>
            </li>
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
            {contactAddress && (
              <li className="pt-1">
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug">{contactAddress}</span>
                </div>
              </li>
            )}
            {contactEmail && (
              <li className="pt-0.5">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground truncate"
                >
                  <Mail className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{contactEmail}</span>
                </a>
              </li>
            )}
            {contactPhone && (
              <li>
                <a
                  href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Phone className="size-3.5 text-primary shrink-0" />
                  <span>{contactPhone}</span>
                </a>
              </li>
            )}
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
