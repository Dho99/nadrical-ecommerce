import { useCallback, useEffect, useState } from 'react'
import { orderRepository, type GatewayPaymentMethod } from '../services/order.repository'

let paymentCache: GatewayPaymentMethod[] | null = null
let paymentPromise: Promise<GatewayPaymentMethod[]> | null = null

async function loadPaymentMethods(force = false): Promise<GatewayPaymentMethod[]> {
  if (!force && paymentCache) return paymentCache
  if (!paymentPromise) {
    paymentPromise = orderRepository
      .fetchPaymentMethods()
      .then((items) => {
        paymentCache = items
        return items
      })
      .finally(() => {
        paymentPromise = null
      })
  }
  return paymentPromise
}

export function clearPaymentMethodsCache(): void {
  paymentCache = null
  paymentPromise = null
}

export function usePaymentMethods() {
  const [methods, setMethods] = useState<GatewayPaymentMethod[]>(paymentCache ?? [])
  const [loading, setLoading] = useState(!paymentCache)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const refresh = useCallback(() => {
    clearPaymentMethodsCache()
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial/retry fetch lifecycle
    setLoading(true)
    setError(null)
    loadPaymentMethods(attempt > 0)
      .then((items) => {
        if (!cancelled) setMethods(items)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMethods([])
          setError(err instanceof Error ? err.message : 'Gagal memuat metode pembayaran')
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
