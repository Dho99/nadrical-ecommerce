import { useEffect, useState } from 'react'
import { taxService, type Tax } from '../services/tax.service'

export function useTaxList(status?: string) {
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
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
    }
    fetch()
  }, [status])

  return { taxes, loading, error }
}
