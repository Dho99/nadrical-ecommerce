import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { loyaltyService, type LoyaltyTier } from '../services/loyalty.service'

export function useLoyalty() {
  const { user } = useAuth()
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [currentTier, setCurrentTier] = useState<LoyaltyTier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch lifecycle
    setLoading(true)
    loyaltyService
      .getTiers()
      .then((items) => {
        if (!cancelled) {
          setTiers(items)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setTiers([])
          setError(err instanceof Error ? err.message : 'Gagal memuat level loyalty')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user?.loyalty_id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear when no tier id
      setCurrentTier(null)
      return
    }
    let cancelled = false
    loyaltyService.getTier(user.loyalty_id).then((item) => {
      if (!cancelled) setCurrentTier(item)
    })
    return () => {
      cancelled = true
    }
  }, [user?.loyalty_id])

  const points = Number(user?.loyalty_points ?? 0)
  const tier = currentTier ?? loyaltyService.resolveTier(tiers, points, user?.loyalty_id)
  const next = loyaltyService.nextTier(tiers, points)
  const pointsToNext = next ? Math.max(0, next.min_point - points) : 0

  return { points, tier, nextTier: next, pointsToNext, tiers, loading, error }
}
