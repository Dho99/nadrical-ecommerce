import { useCallback, useEffect, useState } from 'react'
import type { AsyncStatus, CursorPage } from '../../../shared/types/common.type'
import type { Product, ProductFilters } from '../types/product.type'
import { productService } from '../services/product.service'

interface InfiniteProductsState {
  items: Product[]
  total: number
  nextCursor: number | null
  error: string | null
  loadedFor: string
}

function filtersKey(filters: ProductFilters): string {
  return [
    filters.category ?? 'all',
    filters.query ?? '',
    filters.sort ?? 'featured',
    String(Boolean(filters.inStockOnly)),
  ].join('|')
}

export function useInfiniteProducts(filters: ProductFilters = {}, limit = 12) {
  const [state, setState] = useState<InfiniteProductsState>({
    items: [],
    total: 0,
    nextCursor: null,
    error: null,
    loadedFor: '',
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const { category, query, sort, inStockOnly } = filters

  const key = filtersKey(filters)
  const status: AsyncStatus = state.error
    ? 'error'
    : state.loadedFor === key
      ? 'success'
      : 'loading'

  useEffect(() => {
    let cancelled = false
    const currentFilters: ProductFilters = { category, query, sort, inStockOnly }

    productService
      .getProductPage(currentFilters, null, limit)
      .then((page: CursorPage<Product>) => {
        if (!cancelled) {
          setState({
            items: page.items,
            total: page.total,
            nextCursor: page.nextCursor,
            error: null,
            loadedFor: key,
          })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            items: [],
            total: 0,
            nextCursor: null,
            error: err instanceof Error ? err.message : 'Failed to load products',
            loadedFor: key,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [category, query, sort, inStockOnly, key, limit, attempt])

  const loadMore = useCallback(async () => {
    if (loadingMore || state.nextCursor === null) return
    setLoadingMore(true)
    try {
      const page = await productService.getProductPage(
        { category, query, sort, inStockOnly },
        state.nextCursor,
        limit,
      )
      setState((prev) => ({
        ...prev,
        items: [...prev.items, ...page.items],
        total: page.total,
        nextCursor: page.nextCursor,
      }))
    } catch {
      // keep previous items; next scroll attempt will retry
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, state.nextCursor, category, query, sort, inStockOnly, limit])

  return {
    items: state.items,
    total: state.total,
    status,
    error: state.error,
    loadingMore,
    hasMore: state.nextCursor !== null,
    loadMore,
    refetch: () => setAttempt((a) => a + 1),
  } satisfies {
    items: Product[]
    total: number
    status: AsyncStatus
    error: string | null
    loadingMore: boolean
    hasMore: boolean
    loadMore: () => Promise<void>
    refetch: () => void
  }
}
