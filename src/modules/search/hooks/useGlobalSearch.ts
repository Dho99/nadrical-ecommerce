import { useEffect, useState } from 'react'
import { searchService, type GlobalSearchItem, type GlobalSearchResponse } from '../services/search.service'

const EMPTY: GlobalSearchResponse = { page: 1, limit: 5, total: 0, has_more: false, categories: [] }

export function useGlobalSearch(term: string, enabled: boolean) {
  const [data, setData] = useState<GlobalSearchResponse>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const query = term.trim()
    if (!enabled || query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when search is disabled
      setData(EMPTY)
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    searchService
      .query(query, 5)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(EMPTY)
          setError(err instanceof Error ? err.message : 'Gagal mencari data lain')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [term, enabled])

  const items: GlobalSearchItem[] = data.categories.flatMap((category) => category.items)
  return { data, items, loading, error }
}
