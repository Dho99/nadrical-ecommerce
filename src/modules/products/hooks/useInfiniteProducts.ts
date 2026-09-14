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
  return JSON.stringify({
    category_id: filters.category_id ?? 'all',
    query: filters.query ?? '',
    sort: filters.sort ?? 'featured',
    in_stock_only: Boolean(filters.in_stock_only),
    discount_only: Boolean(filters.discount_only),
    min_price: filters.min_price ?? null,
    max_price: filters.max_price ?? null,
    specs: filters.specs ?? {},
  })
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

  const key = filtersKey(filters)
  const status: AsyncStatus = state.error
    ? 'error'
    : state.loadedFor === key
      ? 'success'
      : 'loading'

  useEffect(() => {
    let cancelled = false

    productService
      .getProductPage(filters, null, limit)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, limit, attempt])

  const loadMore = useCallback(async () => {
    if (loadingMore || state.nextCursor === null) return
    setLoadingMore(true)
    try {
      const page = await productService.getProductPage(
        filters,
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
  }, [loadingMore, state.nextCursor, filters, limit])

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
