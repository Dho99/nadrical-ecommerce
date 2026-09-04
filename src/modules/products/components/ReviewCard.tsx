import { BadgeCheck } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import type { Review } from '../types/review.type'
import { StarRating } from './StarRating'

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const AVATAR_COLORS = [
  'bg-primary text-primary-foreground',
  'bg-emerald-600 text-white',
  'bg-sky-600 text-white',
  'bg-violet-600 text-white',
  'bg-rose-600 text-white',
  'bg-amber-600 text-white',
]

function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <article className="flex gap-3 rounded-lg border bg-card p-4">
      <span
        aria-hidden="true"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          avatarColor(review.author),
        )}
      >
        {initials(review.author)}
      </span>
      <div className="min-w-0 grow">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold">{review.author}</span>
          {review.verified && (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <BadgeCheck className="size-3.5" />
              Verified
            </span>
          )}
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">{date}</span>
        </div>
        <StarRating rating={review.rating} className="mt-1" />
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
      </div>
    </article>
  )
}
