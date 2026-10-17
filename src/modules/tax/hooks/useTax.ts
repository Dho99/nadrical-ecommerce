import { useCallback, useEffect, useState } from 'react'
import { taxService, type Tax } from '../services/tax.service'
import { websocketService } from '../../../shared/lib/websocket'

export function useTaxList(status?: string) {
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTaxes = useCallback(async () => {
    try {
      setLoading(true)
      const result = await taxService.list({ status })
      setTaxes(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load taxes')
      setTaxes([])
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    fetchTaxes()

    // 1. Real-time WebSocket event from backend
    const unsub1 = websocketService.on('tax_updated', () => {
      fetchTaxes()
    })
    const unsub2 = websocketService.on('data_updated', (payload: any) => {
      if (!payload || payload.resource === 'taxes') {
        fetchTaxes()
      }
    })

    // 2. Window focus revalidation
    const onFocus = () => {
      fetchTaxes()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      unsub1()
      unsub2()
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchTaxes])

  return { taxes, loading, error, refetch: fetchTaxes }
}

export function useActiveTaxes() {
  return useTaxList('active')
}
