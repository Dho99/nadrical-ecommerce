import { useCallback, useEffect, useState } from 'react'
import { orderRepository, type GatewayShippingMethod } from '../services/order.repository'

let shippingCache: GatewayShippingMethod[] | null = null
let shippingPromise: Promise<GatewayShippingMethod[]> | null = null

async function loadShippingMethods(force = false): Promise<GatewayShippingMethod[]> {
  if (!force && shippingCache) return shippingCache
  if (!shippingPromise) {
    shippingPromise = orderRepository
      .fetchShippingMethods()
      .then((items) => {
        shippingCache = items
        return items
      })
      .finally(() => {
        shippingPromise = null
      })
  }
  return shippingPromise
}

export function clearShippingMethodsCache(): void {
  shippingCache = null
  shippingPromise = null
}

export function useShippingMethods() {
  const [methods, setMethods] = useState<GatewayShippingMethod[]>(shippingCache ?? [])
  const [loading, setLoading] = useState(!shippingCache)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const refresh = useCallback(() => {
    clearShippingMethodsCache()
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial/retry fetch lifecycle
    setLoading(true)
    setError(null)
    loadShippingMethods(attempt > 0)
      .then((items) => {
        if (!cancelled) setMethods(items)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMethods([])
          setError(err instanceof Error ? err.message : 'Gagal memuat metode pengiriman')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  return { methods, loading, error, refresh }
}
