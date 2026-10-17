import { useEffect, useState } from 'react'
import type { ProductCategory } from '../types/product.type'
import { productService } from '../services/product.service'
import { CATEGORIES } from '../constants/product.constants'
import { websocketService } from '../../../shared/lib/websocket'

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>(CATEGORIES)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRefetch = () => setAttempt((a) => a + 1)
    const unsub1 = websocketService.on('categories_updated', triggerRefetch)
    const unsub2 = websocketService.on('category_updated', triggerRefetch)
    const unsub3 = websocketService.on('data_updated', (payload: any) => {
      if (!payload || payload.resource === 'categories') {
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
  }, [])

  useEffect(() => {
    let cancelled = false
    productService.getCategories().then((cats) => {
      if (!cancelled) setCategories(cats)
    })
    return () => {
      cancelled = true
    }
  }, [attempt])

  return categories
}
