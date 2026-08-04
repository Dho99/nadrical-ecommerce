import { useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Product } from '../types/product.type'
import { productService } from '../services/product.service'

interface ProductState {
  product: Product | null
  error: string | null
  loadedFor: string
}

export function useProduct(id: string | undefined): ProductState & { status: AsyncStatus } {
  const [state, setState] = useState<ProductState>({
    product: null,
    error: null,
    loadedFor: '',
  })

  const status: AsyncStatus = state.error
    ? 'error'
    : state.product && state.loadedFor === id
      ? 'success'
      : 'loading'

  useEffect(() => {
    if (!id) return
    let cancelled = false

    productService
      .getProductById(id)
      .then((product) => {
        if (!cancelled) setState({ product, error: null, loadedFor: id })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            product: null,
            error: err instanceof Error ? err.message : 'Failed to load product',
            loadedFor: id,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { ...state, status }
}
