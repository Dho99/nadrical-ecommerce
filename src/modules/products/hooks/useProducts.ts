import { useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Product, ProductFilters } from '../types/product.type'
import { productService } from '../services/product.service'

interface ProductsState {
  products: Product[]
  error: string | null
  loadedFor: string
}

function filtersKey(category_id: ProductFilters['category_id'], query: string, sort: ProductFilters['sort'], in_stock_only: boolean): string {
  return [category_id ?? 'all', query ?? '', sort ?? 'featured', String(in_stock_only)].join('|')
}

export function useProducts(filters: ProductFilters = {}) {
  const { category_id, query, sort, in_stock_only } = filters
  const [state, setState] = useState<ProductsState>({
    products: [],
    error: null,
    loadedFor: '',
  })
  const [attempt, setAttempt] = useState(0)

  const key = filtersKey(category_id, query ?? '', sort, Boolean(in_stock_only))
  const status: AsyncStatus = state.error ? 'error' : state.loadedFor === key ? 'success' : 'loading'

  useEffect(() => {
    let cancelled = false
    const currentFilters: ProductFilters = { category_id, query, sort, in_stock_only }

    productService
      .getProducts(currentFilters)
      .then((products) => {
        if (!cancelled) setState({ products, error: null, loadedFor: key })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            products: [],
            error: err instanceof Error ? err.message : 'Failed to load products',
            loadedFor: key,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [category_id, query, sort, in_stock_only, key, attempt])

  return {
    products: state.products,
    status,
    error: state.error,
    refetch: () => setAttempt((a) => a + 1),
  } satisfies {
    products: Product[]
    status: AsyncStatus
    error: string | null
    refetch: () => void
  }
}
