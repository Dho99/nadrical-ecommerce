import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from '../../../shared/lib/alert'
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
import { cn } from '../../../shared/utils/cn'
import type { Review, ReviewRating } from '../types/review.type'
import { reviewService } from '../services/review.service'

interface ReviewEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  review: Review | null
  onUpdated: () => void
}

export function ReviewEditDialog({ open, onOpenChange, productId, review, onUpdated }: ReviewEditDialogProps) {
  const [rating, setRating] = useState<ReviewRating>(5)
  const [hover, setHover] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!review) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync form when review changes
    setRating(review.rating)
    setComment(review.comment)
  }, [review])

  const submit = async () => {
    if (!review) return
    if (!comment.trim()) {
      toast.error('Ulasan tidak boleh kosong')
      return
    }
    setSubmitting(true)
    try {
      await reviewService.updateReview(productId, review.id, {
        rating,
        comment: comment.trim(),
      })
      toast.success('Ulasan diperbarui')
      onOpenChange(false)
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui ulasan')
    } finally {
      setSubmitting(false)
    }
  }

  const activeRating = hover ?? rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold tracking-tight">Edit Ulasan</DialogTitle>
          <DialogDescription>Perbarui rating atau komentar ulasan Anda.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4">
            <Label className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Rating</Label>
            <div className="flex items-center gap-1">
              {([1, 2, 3, 4, 5] as ReviewRating[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} bintang`}
                  onMouseEnter={() => setHover(value)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setRating(value)}
                  className="rounded p-0.5"
                >
                  <Star
                    className={cn(
                      'size-7 transition-colors',
                      value <= activeRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-edit-comment" className="mb-1 block text-xs text-muted-foreground">
              Komentar
            </Label>
            <Textarea
              id="review-edit-comment"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={() => void submit()} disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
