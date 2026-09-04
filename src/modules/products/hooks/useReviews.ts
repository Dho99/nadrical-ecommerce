import { useCallback, useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Review, ReviewQuery, ReviewRating, ReviewStats } from '../types/review.type'
import { reviewService, type ReviewPage } from '../services/review.service'

interface ReviewState {
  items: Review[]
  stats: ReviewStats | null
  total: number
  error: string | null
  loadedKey: string
}

interface UseReviewsOptions {
  page?: number
  limit?: number
  rating?: ReviewRating | 'all'
  sort?: ReviewQuery['sort']
  hintRating?: number
  hintCount?: number
}

export function useReviews(productId: string | undefined, options: UseReviewsOptions = {}) {
  const { page = 1, limit = 10, rating = 'all', sort = 'rating-desc', hintRating, hintCount } = options
  const [state, setState] = useState<ReviewState>({
    items: [],
    stats: null,
    total: 0,
    error: null,
    loadedKey: '',
  })
  const [attempt, setAttempt] = useState(0)

  const key = `${productId}|${page}|${limit}|${rating}|${sort}|${hintRating ?? ''}|${hintCount ?? ''}`
  const status: AsyncStatus = state.error ? 'error' : state.loadedKey === key ? 'success' : 'loading'

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    const hints = hintRating !== undefined ? { rating: hintRating, reviewCount: hintCount ?? 18 } : undefined
    reviewService
      .getReviews(productId, { page, limit, rating, sort }, hints)
      .then((res: ReviewPage) => {
        if (!cancelled) {
          setState({
            items: res.items,
            stats: res.stats,
            total: res.total,
            error: null,
            loadedKey: key,
          })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            items: [],
            stats: null,
            total: 0,
            error: err instanceof Error ? err.message : 'Failed to load reviews',
            loadedKey: key,
          })
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key encodes all reactive inputs
  }, [productId, key, attempt])

  const refetch = useCallback(() => setAttempt((a) => a + 1), [])

  return { ...state, status, refetch }
}
