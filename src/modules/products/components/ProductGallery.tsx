import { useCallback, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { galleryVariants } from '../../../shared/utils/unsplash'
import { Dialog, DialogContent, DialogTitle } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import type { Product } from '../types/product.type'

interface Slide {
  src: string
  label?: string
}

interface ProductGalleryProps {
  product: Product
}

function slidesFor(product: Product): Slide[] {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.map((src) => ({ src }))
  }
  const variants = galleryVariants(product.cover_image_url)
  if (variants.length > 0) {
    return variants.map((v) => ({ src: v.url, label: v.label }))
  }
  return [{ src: product.cover_image_url }]
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const slides = useMemo(() => slidesFor(product), [product])
  const count = slides.length

  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const touchX = useRef<number | null>(null)

  const go = useCallback(
    (dir: 1 | -1) => {
      setLightboxIndex((i) => (i + dir + count) % count)
    },
    [count],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    },
    [go],
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const delta = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1)
    touchX.current = null
  }

  if (count === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          setLightboxIndex(active)
          setLightbox(true)
        }}
        className="group relative block aspect-[4/3] max-h-[520px] w-full cursor-zoom-in overflow-hidden rounded-lg border bg-muted text-left"
        aria-label={`View ${product.name} images full screen`}
      >
        <ProductImage
          src={slides[active].src}
          alt={slides[active].label ? `${product.name} — ${slides[active].label}` : product.name}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2 py-1.5 font-mono text-[11px] text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Expand className="size-4" />
          {count > 1 ? `${active + 1}/${count}` : 'FULLSCREEN'}
        </span>
      </button>

      {count > 1 && (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, minmax(0, 1fr))` }}
          role="tablist"
          aria-label="Product images"
        >
          {slides.map((slide, i) => (
            <button
              key={`${slide.src}-${i}`}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={slide.label ?? `Image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                'aspect-[4/3] overflow-hidden rounded-md border bg-muted transition-colors',
                active === i
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-foreground/40',
              )}
            >
              <ProductImage
                src={slide.src}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {count > 1 && (
        <p className="text-right font-mono text-xs text-muted-foreground">
          VIEW · {active + 1} OF {count}
        </p>
      )}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          showCloseButton={false}
          onKeyDown={handleKeyDown}
          className="top-0 left-0 z-[60] h-screen w-screen max-w-none -translate-x-0 -translate-y-0 gap-0 rounded-none bg-black/95 p-0 ring-0 data-open:zoom-in-100"
        >
          <DialogTitle className="sr-only">
            {product.name} — image {lightboxIndex + 1} of {count}
          </DialogTitle>

          <div
            className="relative flex h-full w-full touch-pan-y items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <ProductImage
              src={slides[lightboxIndex].src}
              alt={slides[lightboxIndex].label ? `${product.name} — ${slides[lightboxIndex].label}` : product.name}
              className="max-h-[82vh] max-w-[92vw] object-contain"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close full screen"
              className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              <X className="size-5" />
            </button>

            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-white/90">
              {lightboxIndex + 1} / {count}
            </p>

            {count > 1 && (
              <div className="absolute right-4 bottom-4 hidden items-center gap-1.5 sm:flex">
                {slides.map((slide, i) => (
                  <button
                    key={`${slide.src}-lb-${i}`}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={cn(
                      'size-2 rounded-full transition-colors',
                      i === lightboxIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70',
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
