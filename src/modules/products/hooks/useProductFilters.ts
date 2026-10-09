import { useEffect, useState } from 'react'
import { productService, type ProductFilterOptions } from '../services/product.service'
import { useDebounce } from '../../../shared/hooks/useDebounce'

export function useProductFilters(deps: { query?: string; category_id?: string }) {
  const debouncedQuery = useDebounce(deps.query ?? '', 300)
  const [data, setData] = useState<ProductFilterOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    productService
      .getFilterOptions(
        { query: debouncedQuery || undefined, category_id: deps.category_id },
        ac.signal,
      )
      .then((res) => {
        if (!ac.signal.aborted) setData(res)
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) return
        const msg = e instanceof Error ? e.message : ''
        const lower = msg.toLowerCase()
        if (lower.includes('canceled') || lower.includes('abort') || lower.includes('aborted')) return
        setError(e instanceof Error ? e.message : 'Failed to load filters')
        setData(null)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [debouncedQuery, deps.category_id])

  return { data, loading, error }
}
