import { useEffect, useState } from 'react'
import type { AsyncStatus, CursorPage } from '../../../shared/types/common.type'
import type { Product } from '../../../shared/types/product.type'
import { adminProductService } from '../services/admin-product.service'
import type { AdminProductFilters } from '../types/admin.type'

interface AdminProductsState {
  items: Product[]
  total: number
  nextCursor: number | null
  error: string | null
  loadedFor: string
}

function filtersKey(filters: AdminProductFilters): string {
  return [filters.query ?? '', filters.category ?? 'all', String(Boolean(filters.inStockOnly))].join('|')
}

export function useAdminProducts(filters: AdminProductFilters = {}, limit = 10) {
  const [state, setState] = useState<AdminProductsState>({
    items: [],
    total: 0,
    nextCursor: null,
    error: null,
    loadedFor: '',
  })
  const [cursor, setCursor] = useState<number | null>(0)
  const [attempt, setAttempt] = useState(0)
  const { query, category, inStockOnly } = filters

  const key = filtersKey(filters)
  const status: AsyncStatus = state.error ? 'error' : state.loadedFor === key ? 'success' : 'loading'

  useEffect(() => {
    let cancelled = false
    const currentFilters: AdminProductFilters = { query, category, inStockOnly }

    adminProductService
      .listProducts(currentFilters, cursor, limit)
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
  }, [key, query, category, inStockOnly, cursor, limit, attempt])

  const pageStart = (cursor ?? 0) + 1

  return {
    products: state.items,
    total: state.total,
    cursor,
    pageStart,
    status,
    error: state.error,
    goNext: () => state.nextCursor !== null && setCursor(state.nextCursor),
    goPrev: () => cursor !== null && cursor > 0 && setCursor(Math.max(0, cursor - limit)),
    refetch: () => setAttempt((a) => a + 1),
  } satisfies {
    products: Product[]
    total: number
    cursor: number | null
    pageStart: number
    status: AsyncStatus
    error: string | null
    goNext: () => void
    goPrev: () => void
    refetch: () => void
  }
}
