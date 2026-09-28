import { useEffect, useState } from 'react'
import { dashboardService, type DashboardSummary } from '../services/dashboard.service'

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await dashboardService.getSummary()
        setSummary(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { summary, loading, error }
}
