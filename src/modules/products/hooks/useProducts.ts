import { useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Product, ProductFilters } from '../types/product.type'
import { productService } from '../services/product.service'
import { websocketService } from '../../../shared/lib/websocket'

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

  // Real-time synchronization on WebSocket events and window focus
  useEffect(() => {
    const triggerRefetch = () => setAttempt((a) => a + 1)
    const unsub1 = websocketService.on('products_updated', triggerRefetch)
    const unsub2 = websocketService.on('product_updated', triggerRefetch)
    const unsub3 = websocketService.on('categories_updated', triggerRefetch)
    const unsub4 = websocketService.on('data_updated', (payload: any) => {
      if (!payload || payload.resource === 'products' || payload.resource === 'categories') {
        triggerRefetch()
      }
    })
    const onFocus = () => triggerRefetch()
    window.addEventListener('focus', onFocus)

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      window.removeEventListener('focus', onFocus)
    }
  }, [])

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
