import { useEffect, useState } from 'react'
import type { ReviewStats } from '../types/review.type'
import { reviewService } from '../services/review.service'

export function useRatingSummary(productId: string | undefined) {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(Boolean(productId))

  useEffect(() => {
    if (!productId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear when product is absent
      setStats(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    reviewService
      .getRatingSummary(productId)
      .then((result) => {
        if (!cancelled) setStats(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productId])

  return { stats, loading }
}
