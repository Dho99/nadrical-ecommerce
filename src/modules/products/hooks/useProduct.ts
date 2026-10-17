import { useEffect, useState } from 'react'
import type { AsyncStatus } from '../../../shared/types/common.type'
import type { Product } from '../types/product.type'
import { productService } from '../services/product.service'
import { websocketService } from '../../../shared/lib/websocket'

interface ProductState {
  product: Product | null
  error: string | null
  loadedFor: string
}

export function useProduct(id: string | undefined): ProductState & { status: AsyncStatus; refetch: () => void } {
  const [state, setState] = useState<ProductState>({
    product: null,
    error: null,
    loadedFor: '',
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!id) return
    const triggerRefetch = () => setAttempt((a) => a + 1)
    const unsub1 = websocketService.on('products_updated', triggerRefetch)
    const unsub2 = websocketService.on('product_updated', (payload: any) => {
      if (!payload || !payload.product_id || payload.product_id === id) {
        triggerRefetch()
      }
    })
    const unsub3 = websocketService.on('data_updated', (payload: any) => {
      if (!payload || payload.resource === 'products') {
        triggerRefetch()
      }
    })
    const onFocus = () => triggerRefetch()
    window.addEventListener('focus', onFocus)

    return () => {
      unsub1()
      unsub2()
      unsub3()
      window.removeEventListener('focus', onFocus)
    }
  }, [id])

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
  }, [id, attempt])

  return { ...state, status, refetch: () => setAttempt((a) => a + 1) }
}
