import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { Dialog, DialogContent, DialogTitle } from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import type { Product } from '../types/product.type'

const CROPS = [
  { position: 'object-center', label: 'Full view' },
  { position: 'object-top', label: 'Detail top' },
  { position: 'object-bottom', label: 'Detail bottom' },
]

interface ProductGalleryProps {
  product: Product
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const crop = CROPS[active]

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border bg-muted text-left"
        aria-label={`Zoom ${product.name} image`}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className={cn('h-full w-full', crop.position)}
        />
        <span className="absolute top-3 right-3 rounded-md bg-background/90 p-1.5 text-muted-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-4" />
        </span>
      </button>
      <div className="mt-3 grid grid-cols-3 gap-2" role="tablist" aria-label="Product views">
        {CROPS.map((thumb, i) => (
          <button
            key={thumb.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`${thumb.label} view`}
            onClick={() => setActive(i)}
            className={cn(
              'aspect-square overflow-hidden rounded-md border bg-muted transition-colors',
              active === i ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-foreground/40',
            )}
          >
            <ProductImage
              src={product.imageUrl}
              alt=""
              className={cn('h-full w-full', thumb.position)}
            />
          </button>
        ))}
      </div>
      <p className="mt-2 text-right font-mono text-xs text-muted-foreground">
        VIEW · {crop.label.toUpperCase()}
      </p>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-[min(92vw,48rem)] p-3">
          <DialogTitle className="sr-only">{product.name} — zoomed image</DialogTitle>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-[80vh] w-full rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
