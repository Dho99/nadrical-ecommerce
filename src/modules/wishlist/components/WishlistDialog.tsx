import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkX, HeartOff } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Skeleton,
} from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { useWishlist } from '../hooks/useWishlist'
import { useWishlistCatalog } from '../hooks/useWishlistCatalog'
import { OPEN_WISHLIST_EVENT } from '../utils/openWishlist'

export function WishlistDialog() {
  const { count, remove, clear } = useWishlist()
  const { products, ready, ids } = useWishlistCatalog()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(OPEN_WISHLIST_EVENT, handler)
    return () => window.removeEventListener(OPEN_WISHLIST_EVENT, handler)
  }, [])

  const addedAt = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of ids) map.set(item.product_id, Date.parse(item.added_at))
    return map
  }, [ids])

  const sorted = useMemo(
    () => [...products].sort((a, b) => (addedAt.get(b.id) ?? 0) - (addedAt.get(a.id) ?? 0)),
    [products, addedAt],
  )

  const loading = count > 0 && !ready

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="font-display text-lg font-bold tracking-tight">
            Wishlist
            <span className="ml-2 font-mono text-xs font-medium text-muted-foreground">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Products you have saved with the bookmark icon
          </DialogDescription>
        </DialogHeader>

        <div className="grow space-y-2 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={<HeartOff className="size-8" />}
              title="Wishlist kosong"
              description="Klik ikon bookmark pada produk untuk menyimpannya di sini."
              className="py-10"
            />
          ) : (
            sorted.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-accent/40"
              >
                <Link to={`/products/${product.id}`} onClick={() => setOpen(false)} className="shrink-0">
                  <ProductImage
                    src={product.cover_image_url}
                    alt={product.name}
                    className="size-16 rounded-md border bg-muted object-cover"
                  />
                </Link>
                <div className="min-w-0 grow">
                  <Link
                    to={`/products/${product.id}`}
                    onClick={() => setOpen(false)}
                    className="line-clamp-1 text-sm font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-0.5 font-display text-sm font-bold tracking-tight">
                    ${product.base_price.toFixed(2)}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">
                    {product.sku}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                >
                  <BookmarkX className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="border-t p-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Tutup
          </Button>
          {count > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                clear()
              }}
            >
              Hapus semua
            </Button>
          )}
          <Button asChild disabled={count === 0}>
            <Link to="/wishlist" onClick={() => setOpen(false)}>
              Lihat semua →
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
