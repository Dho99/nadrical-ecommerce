import { useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Product, ProductFilters } from '../types/product.type'
import { productService } from '../services/product.service'

interface ProductsState {
  products: Product[]
  error: string | null
  loadedFor: string
}

function filtersKey(category: ProductFilters['category'], query: string, sort: ProductFilters['sort'], inStockOnly: boolean): string {
  return [category ?? 'all', query ?? '', sort ?? 'featured', String(inStockOnly)].join('|')
}

export function useProducts(filters: ProductFilters = {}) {
  const { category, query, sort, inStockOnly } = filters
  const [state, setState] = useState<ProductsState>({
    products: [],
    error: null,
    loadedFor: '',
  })
  const [attempt, setAttempt] = useState(0)

  const key = filtersKey(category, query ?? '', sort, Boolean(inStockOnly))
  const status: AsyncStatus = state.error ? 'error' : state.loadedFor === key ? 'success' : 'loading'

  useEffect(() => {
    let cancelled = false
    const currentFilters: ProductFilters = { category, query, sort, inStockOnly }

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
  }, [category, query, sort, inStockOnly, key, attempt])

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
