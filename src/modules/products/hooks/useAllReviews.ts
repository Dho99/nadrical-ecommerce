import { useEffect, useState } from 'react'
import type { Review, ReviewStats } from '../types/review.type'
import { reviewService } from '../services/review.service'

export function useAllReviews(page = 1, limit = 12) {
  const [items, setItems] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial/retry fetch lifecycle
    setLoading(true)
    reviewService
      .getAllReviews(page, limit)
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setStats(result.stats)
        setTotal(result.total)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setItems([])
        setTotal(0)
        setError(err instanceof Error ? err.message : 'Gagal memuat ulasan')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, limit])

  return { items, stats, total, loading, error }
}
