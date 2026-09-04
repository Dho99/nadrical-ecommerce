import { Star } from 'lucide-react'
import type { ReviewRating, ReviewStats } from '../types/review.type'

const STAR_LABELS: ReviewRating[] = [5, 4, 3, 2, 1]

interface RatingSummaryProps {
  stats: ReviewStats
  className?: string
}

export function RatingSummary({ stats, className }: RatingSummaryProps) {
  const avg = stats.count > 0 ? stats.avg : 0
  return (
    <div className={`rounded-xl border bg-card p-5 ${className ?? ''}`}>
      <div className="flex items-center gap-4">
        <p className="font-display text-5xl font-bold tracking-tight">{avg.toFixed(1)}</p>
        <div>
          <div className="flex items-center gap-0.5">
            {([1, 2, 3, 4, 5] as ReviewRating[]).map((i) => (
              <Star
                key={i}
                className={
                  i <= Math.round(avg)
                    ? 'size-5 fill-amber-400 text-amber-400'
                    : 'size-5 fill-transparent text-muted-foreground/40'
                }
              />
            ))}
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {stats.count} ratings
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {STAR_LABELS.map((star) => {
          const n = stats.distribution[star] ?? 0
          const pct = stats.count > 0 ? Math.round((n / stats.count) * 100) : 0
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-6 font-mono text-xs text-muted-foreground">{star}★</span>
              <div className="h-2 grow overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right font-mono text-xs text-muted-foreground">{n}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
