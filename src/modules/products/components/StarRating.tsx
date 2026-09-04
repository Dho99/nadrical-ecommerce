import { Star } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import type { ReviewRating } from '../types/review.type'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
  showValue?: boolean
  className?: string
}

export function StarRating({ rating, size = 'sm', showValue = false, className }: StarRatingProps) {
  const full = Math.round(rating)
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      <span className="inline-flex" aria-hidden="true">
        {([1, 2, 3, 4, 5] as ReviewRating[]).map((i) => (
          <Star
            key={i}
            className={cn(
              size === 'md' ? 'size-4' : 'size-3.5',
              i <= full ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/40',
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}
