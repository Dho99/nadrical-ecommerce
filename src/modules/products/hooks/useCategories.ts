import { useEffect, useState } from 'react'
import type { ProductCategory } from '../types/product.type'
import { productService } from '../services/product.service'
import { CATEGORIES } from '../constants/product.constants'

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>(CATEGORIES)

  useEffect(() => {
    let cancelled = false
    productService.getCategories().then((cats) => {
      if (!cancelled) setCategories(cats)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return categories
}
