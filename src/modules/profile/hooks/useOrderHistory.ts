import { useCallback, useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { OrderWithItems } from '../../../shared/types/order.type'
import { profileService } from '../services/profile.service'

export function useOrderHistory(email: string | null) {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const status: AsyncStatus = error ? 'error' : loaded ? 'success' : 'loading'

  useEffect(() => {
    if (!email) return
    let cancelled = false
    profileService
      .getOrderHistory(email)
      .then(async (items) => {
        if (cancelled) return
        if (items.length === 0) {
          await profileService.ensureUserSeeded(email)
          const seeded = await profileService.getOrderHistory(email)
          if (!cancelled) {
            setOrders(seeded)
            setLoaded(true)
          }
        } else {
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

  const refetch = useCallback(() => setAttempt((a) => a + 1), [])

  const cancel = useCallback(
    async (orderId: string): Promise<void> => {
      if (!email) return
      setCancellingId(orderId)
      try {
        await profileService.cancelOrder(email, orderId)
        refetch()
      } finally {
        setCancellingId(null)
      }
    },
    [email, refetch],
  )

  return { orders, status, error, refetch, cancel, cancellingId }
}
