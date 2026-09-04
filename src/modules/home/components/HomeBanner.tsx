import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { unsplashUrl } from '../../../shared/utils/unsplash'

interface BannerSlide {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  image: string
  href: string
  cta: string
  align?: 'left' | 'center'
}

const BANNERS: BannerSlide[] = [
  {
    id: 'banner-1',
    eyebrow: 'Nadrical Heritage · New Drop',
    title: 'Comforto\nActive',
    subtitle: 'To Run or To Office — lightweight knit, all-day cushion',
    image: unsplashUrl('photo-1542291026-7eec264c27ff', 1920),
    href: '/products?category=apparel',
    cta: 'Shop Apparel',
  },
  {
    id: 'banner-2',
    eyebrow: 'Leather Collection · Crafted in Bandung',
    title: 'Brodo\nHeritage',
    subtitle: 'Full-grain leather tote & essentials — built to age with you',
    image: unsplashUrl('photo-1584917865442-de89df76afd3', 1920),
    href: '/products?category=accessories',
    cta: 'Shop Accessories',
  },
  {
    id: 'banner-3',
    eyebrow: 'Outdoors · Built for the Trail',
    title: 'Camp\nEssentials',
    subtitle: '4-person tent to insulated bottle — ready in 10 minutes',
    image: unsplashUrl('photo-1478131143081-80f7f84ca84d', 1920),
    href: '/products?category=outdoors',
    cta: 'Shop Outdoors',
  },
  {
    id: 'banner-4',
    eyebrow: 'Home & Living · Mid-Century Warmth',
    title: 'Everyday\nLiving',
    subtitle: 'Sofa, lighting, linen — curated for calm, everyday spaces',
    image: unsplashUrl('photo-1555041469-a586c61ea9bc', 1920),
    href: '/products?category=home',
    cta: 'Shop Home',
  },
  {
    id: 'banner-5',
    eyebrow: 'Electronics · Studio Tuned',
    title: 'Everyday\nSound',
    subtitle: 'Headphones, earbuds, watches — 30h battery, 48h dispatch',
    image: unsplashUrl('photo-1505740420928-5e560c06d30e', 1920),
    href: '/products?category=electronics',
    cta: 'Shop Electronics',
  },
]

export function HomeBanner() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<number | null>(null)

  const next = useCallback(() => setActive((p) => (p + 1) % BANNERS.length), [])
  const prev = useCallback(() => setActive((p) => (p - 1 + BANNERS.length) % BANNERS.length), [])

  useEffect(() => {
    if (paused) return
    timerRef.current = window.setInterval(next, 4500)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [paused, next])

  // touch swipe
  const touchStart = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return
    const diff = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(diff) > 50) {
      if (diff < 0) next()
      else prev()
    }
    touchStart.current = null
  }

  return (
    <section
      className="relative overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="relative h-[420px] sm:h-[480px] lg:h-[560px]">
        {BANNERS.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              idx === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={idx !== active}
          >
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
            {/* bro.do style: subtle dark overlay + left gradient for legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            <div className="relative container mx-auto flex h-full items-center px-5 sm:px-8">
              <div className="max-w-xl">
                <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-white/80 uppercase">
                  {slide.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-4xl leading-[0.9] font-bold tracking-tight whitespace-pre-line text-white sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.href}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold tracking-tight text-black transition hover:bg-white/90"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* arrows — bro.do uses subtle side chevrons on hover */}
        <button
          type="button"
          aria-label="Previous banner"
          onClick={prev}
          className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md backdrop-blur transition hover:bg-white sm:flex lg:left-6"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next banner"
          onClick={next}
          className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md backdrop-blur transition hover:bg-white sm:flex lg:right-6"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* dots — bro.do pagination centered bottom */}
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === active}
              onClick={() => setActive(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === active ? 'w-8 bg-white' : 'w-3 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* thin secondary strip mimicking bro.do category quick links below banner */}
      <div className="border-t border-white/10 bg-black text-white">
        <div className="container mx-auto flex gap-2 overflow-x-auto px-5 py-3 text-xs font-medium tracking-wide sm:px-8">
          {BANNERS.map((b) => (
            <Link
              key={`strip-${b.id}`}
              to={b.href}
              className="whitespace-nowrap rounded-full border border-white/20 px-3.5 py-1.5 text-white/80 transition hover:border-white hover:text-white"
            >
              {b.cta}
            </Link>
          ))}
          <Link
            to="/products"
            className="whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-black transition hover:bg-white/90"
          >
            All Catalog →
          </Link>
        </div>
      </div>
    </section>
  )
}
