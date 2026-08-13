import { useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { OrderRecord } from '../../../shared/types/order.type'
import { profileService } from '../services/profile.service'

export function useOrderHistory(email: string | null) {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const status: AsyncStatus = error ? 'error' : loaded ? 'success' : 'loading'

  useEffect(() => {
    if (!email) return
    let cancelled = false
    profileService
      .getOrderHistory(email)
      .then((items) => {
        if (!cancelled) {
          setOrders(items)
          setLoaded(true)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load order history')
        }
      })
    return () => {
      cancelled = true
    }
  }, [email, attempt])

  return {
    orders,
    status,
    error,
    refetch: () => setAttempt((a) => a + 1),
  }
}
