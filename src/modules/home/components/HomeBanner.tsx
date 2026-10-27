import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { unsplashUrl } from '../../../shared/utils/unsplash'
import { useBannerSlides } from '../hooks/useBanner'

interface BannerSlide {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  image: string
  imageMobile?: string
  href: string
  cta: string
  align?: 'left' | 'center'
  desktopTemplate?: string
  desktopHeightPx?: number
  mobileTemplate?: string
  mobileHeightPx?: number
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
  const { slides: apiSlides } = useBannerSlides()
  const slides: BannerSlide[] =
    apiSlides.length > 0
      ? apiSlides.map((s, i) => ({
          id: `api-banner-${i}`,
          eyebrow: s.badge || '',
          title: s.title || '',
          subtitle: s.subtitle || '',
          image: s.image,
          imageMobile: s.imageMobile,
          href: s.ctaHref || '/products',
          cta: s.ctaLabel || '',
          desktopTemplate: s.desktopTemplate,
          desktopHeightPx: s.desktopHeightPx,
          mobileTemplate: s.mobileTemplate,
          mobileHeightPx: s.mobileHeightPx,
        }))
      : BANNERS
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setActive(0)
  }, [slides.length])

  const next = useCallback(() => setActive((p) => (p + 1) % slides.length), [slides.length])
  const prev = useCallback(() => setActive((p) => (p - 1 + slides.length) % slides.length), [slides.length])

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

  // mouse drag
  const mouseStart = useRef<number | null>(null)
  const onMouseDown = (e: React.MouseEvent) => {
    mouseStart.current = e.clientX
  }
  const onMouseUp = (e: React.MouseEvent) => {
    if (mouseStart.current == null) return
    const diff = e.clientX - mouseStart.current
    if (Math.abs(diff) > 50) {
      if (diff < 0) next()
      else prev()
    }
    mouseStart.current = null
  }

  const currentSlide = slides[active] || slides[0]
  const mobileTemplate = currentSlide?.mobileTemplate || 'widescreen_16_9'
  const desktopTemplate = currentSlide?.desktopTemplate

  let mobileHeightClass = 'aspect-[16/9] sm:aspect-auto'
  let desktopHeightClass = 'sm:h-[480px]'
  const inlineStyles: Record<string, string> = {}

  if (mobileTemplate === 'marketplace_2_1') {
    mobileHeightClass = 'aspect-[2/1] sm:aspect-auto'
  } else if (mobileTemplate === 'widescreen_16_9') {
    mobileHeightClass = 'aspect-[16/9] sm:aspect-auto'
  } else if (mobileTemplate === 'showcase_4_3') {
    mobileHeightClass = 'aspect-[4/3] sm:aspect-auto'
  } else if (mobileTemplate === 'editorial_4_5') {
    mobileHeightClass = 'aspect-[4/5] sm:aspect-auto'
  } else if (mobileTemplate === 'custom') {
    mobileHeightClass = 'h-[var(--banner-mobile-h)]'
    inlineStyles['--banner-mobile-h'] = `${currentSlide?.mobileHeightPx || 220}px`
  }

  if (desktopTemplate === 'compact') {
    desktopHeightClass = 'sm:h-[380px]'
  } else if (desktopTemplate === 'standard') {
    desktopHeightClass = 'sm:h-[480px]'
  } else if (desktopTemplate === 'large') {
    desktopHeightClass = 'sm:h-[600px]'
  } else if (desktopTemplate === 'cinematic') {
    desktopHeightClass = 'sm:h-[720px]'
  } else if (desktopTemplate === 'custom') {
    desktopHeightClass = 'sm:h-[var(--banner-desktop-h)]'
    inlineStyles['--banner-desktop-h'] = `${currentSlide?.desktopHeightPx || 480}px`
  }

  return (
    <section
      className="group relative cursor-grab overflow-hidden bg-black active:cursor-grabbing"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); mouseStart.current = null }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div
        className={`relative ${mobileHeightClass} ${desktopHeightClass} max-h-[85vh] transition-all duration-300`}
        style={Object.keys(inlineStyles).length > 0 ? (inlineStyles as React.CSSProperties) : undefined}
      >
        {slides.map((slide, idx) => {
          const hasContent = Boolean(
            slide.eyebrow || slide.title || slide.subtitle || slide.cta
          );

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                idx === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-hidden={idx !== active}
            >
              <picture className="absolute inset-0 h-full w-full">
                {slide.imageMobile && (
                  <source media="(max-width: 639px)" srcSet={slide.imageMobile} />
                )}
                <img
                  src={slide.image}
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out ${
                    idx === active ? 'scale-100' : 'scale-105'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </picture>
              {/* bro.do style: subtle dark overlay + left gradient for legibility */}
              {hasContent && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </>
              )}

              {hasContent && (
                <div className="relative mx-auto w-full max-w-7xl flex h-full items-center px-5 pb-4 sm:pb-0 sm:px-8">
                  <div className="max-w-xl">
                    {slide.eyebrow && (
                      <p className="font-mono text-[10px] sm:text-[11px] font-medium tracking-[0.16em] text-white/80 uppercase">
                        {slide.eyebrow}
                      </p>
                    )}
                    {slide.title && (
                      <h2 className="mt-1.5 sm:mt-3 font-display text-2xl leading-[0.95] sm:leading-[0.9] font-bold tracking-tight whitespace-pre-line text-white sm:text-5xl lg:text-6xl">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="mt-1.5 sm:mt-3 max-w-md text-xs sm:text-base leading-relaxed text-white/80 line-clamp-2 sm:line-clamp-none">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.cta && (
                      <Link
                        to={slide.href}
                        className="mt-3 sm:mt-6 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold tracking-tight text-black transition hover:bg-white/90"
                      >
                        {slide.cta}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* arrows — bro.do uses subtle side chevrons on hover */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              onClick={prev}
              className="absolute top-1/2 left-3 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md ring-1 ring-black/10 backdrop-blur opacity-0 pointer-events-none transition-all duration-300 hover:scale-105 hover:bg-white focus-visible:ring-2 focus-visible:ring-white active:scale-95 group-hover:opacity-100 group-hover:pointer-events-auto sm:flex lg:left-6"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={next}
              className="absolute top-1/2 right-3 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md ring-1 ring-black/10 backdrop-blur opacity-0 pointer-events-none transition-all duration-300 hover:scale-105 hover:bg-white focus-visible:ring-2 focus-visible:ring-white active:scale-95 group-hover:opacity-100 group-hover:pointer-events-auto sm:flex lg:right-6"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* dots — bro.do pagination centered bottom */}
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === active}
              onClick={() => setActive(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === active
                  ? 'w-8 bg-white dark:bg-white'
                  : 'w-3 bg-white/50 hover:bg-white/80 dark:bg-white/40 dark:hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* thin secondary strip mimicking bro.do category quick links below banner */}
      {/* <div className="border-t border-white/10 bg-black text-white">
        <div className="mx-auto w-full max-w-7xl flex gap-2 overflow-x-auto px-5 py-3 text-xs font-medium tracking-wide sm:px-8">
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
            All Products →
          </Link>
        </div>
      </div> */}
    </section>
  )
}
