import { useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import { profileService } from '../services/profile.service'
import type { ProfileStats } from '../types/profile.type'

export function useProfileStats(email: string | null) {
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const status: AsyncStatus = error ? 'error' : loaded ? 'success' : 'loading'

  useEffect(() => {
    if (!email) return
    let cancelled = false
    profileService
      .getStats(email)
      .then((data) => {
        if (!cancelled) {
          setStats(data)
          setLoaded(true)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load profile')
        }
      })
    return () => {
      cancelled = true
    }
  }, [email, attempt])

  return {
    stats,
    status,
    error,
    refetch: () => setAttempt((a) => a + 1),
  }
}
