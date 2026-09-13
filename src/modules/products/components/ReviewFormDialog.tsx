import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from '../../../shared/components/ui'
import { ProductImage } from '../../../shared/components/ProductImage'
import { userReviewStorage, type UserReview } from '../services/userReview.storage'
import type { ReviewRating } from '../types/review.type'

interface ReviewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: string
    name: string
    cover_image_url?: string
  }
  orderNumber: string
  variantName?: string
  reviewerName?: string
  onSubmitted?: (review: UserReview) => void
}

export function ReviewFormDialog({
  open,
  onOpenChange,
  product,
  orderNumber,
  variantName,
  reviewerName = 'Demo User',
  onSubmitted,
}: ReviewFormDialogProps) {
  const [rating, setRating] = useState<ReviewRating>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast.error('Silakan isi ulasan Anda')
      return
    }
    setSubmitting(true)
    try {
      const review = userReviewStorage.addReview({
        productId: product.id,
        orderNumber,
        rating,
        comment: comment.trim(),
        reviewerName,
        variantName,
      })
      toast.success('Ulasan berhasil dikirim! Terima kasih atas masukan Anda.', {
        position: 'top-center',
        style: { marginTop: '72px' },
        closeButton: true,
      })
      onSubmitted?.(review)
      onOpenChange(false)
      setComment('')
    } finally {
      setSubmitting(false)
    }
  }

  const activeRating = hoverRating ?? rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold tracking-tight">Beri Ulasan Produk</DialogTitle>
          <DialogDescription>
            Berikan penilaian dan ulasan jujur untuk membantu pembeli lain.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
            <ProductImage src={product.cover_image_url || ''} alt={product.name} className="h-full w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            {variantName && (
              <p className="truncate text-xs text-muted-foreground">Variant: {variantName}</p>
            )}
            <p className="font-mono text-[11px] text-muted-foreground">Order: {orderNumber}</p>
          </div>
        </div>

        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-2 rounded-lg border p-4 bg-card">
            <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Pilih Rating Bintang
            </Label>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating bintang">
              {([1, 2, 3, 4, 5] as ReviewRating[]).map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  aria-label={`${star} bintang`}
                  className="p-1 transition-transform hover:scale-115 focus-visible:outline-none"
                >
                  <Star
                    className={`size-7 transition-colors ${
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
              {activeRating === 5
                ? '5 / 5 — Sangat Memuaskan'
                : activeRating === 4
                  ? '4 / 5 — Memuaskan'
                  : activeRating === 3
                    ? '3 / 5 — Cukup Baik'
                    : activeRating === 2
                      ? '2 / 5 — Kurang Memuaskan'
                      : '1 / 5 — Buruk'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment-text">Ulasan Produk</Label>
            <Textarea
              id="comment-text"
              placeholder="Tulis ulasan Anda mengenai kualitas, bahan, atau fungsi produk..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting || !comment.trim()}>
            {submitting ? 'Mengirim…' : 'Kirim Ulasan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
