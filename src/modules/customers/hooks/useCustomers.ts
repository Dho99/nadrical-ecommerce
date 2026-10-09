import { useCallback, useEffect, useState } from 'react'
import { customersService } from '../services/customers.service'
import type { Customer } from '../types/customer.type'

export function useCustomers(params: { page?: number; limit?: number; search?: string } = {}) {
  const { page = 1, limit = 20, search = '' } = params
  const [items, setItems] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const refetch = useCallback(() => setAttempt((a) => a + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    customersService
      .list({ page, limit, search })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setTotal(res.total)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Gagal memuat customer')
        setItems([])
        setTotal(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, limit, search, attempt])

  return { items, total, loading, error, refetch }
}
