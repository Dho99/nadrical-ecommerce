import { useState } from 'react'
import { parseProductFilters, toProductParams } from '../utils/filters'
import type { ProductFilters } from '../types/product.type'
import { useProducts } from './useProducts'

interface UseCatalogResult {
  filters: ProductFilters
  setFilters: (patch: Partial<ProductFilters>) => void
  products: ReturnType<typeof useProducts>['products']
  status: ReturnType<typeof useProducts>['status']
  error: ReturnType<typeof useProducts>['error']
  refetch: ReturnType<typeof useProducts>['refetch']
  parseParams: typeof parseProductFilters
  toParams: typeof toProductParams
}

export function useCatalog(initial: ProductFilters = {}): UseCatalogResult {
  const [filters, setFiltersState] = useState<ProductFilters>(initial)
  const { products, status, error, refetch } = useProducts(filters)

  const setFilters = (patch: Partial<ProductFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }))
  }

  const initialKey = JSON.stringify([initial.category_id, initial.query, initial.sort])
  const [prevKey, setPrevKey] = useState(initialKey)
  if (prevKey !== initialKey) {
    setPrevKey(initialKey)
    setFiltersState(initial)
  }

  return { filters, setFilters, products, status, error, refetch, parseParams: parseProductFilters, toParams: toProductParams }
}
