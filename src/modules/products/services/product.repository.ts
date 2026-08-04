import type { Product } from '../types/product.type'
import { PRODUCT_CATALOG } from './mock-data'

const STORAGE_KEY = 'store-products-v1'

function seed(): Product[] {
  return PRODUCT_CATALOG.map((p) => ({ ...p, specs: [...p.specs] }))
}

export const productRepository = {
  list(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as Product[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // fall through to reseed
    }
    const fresh = seed()
    this.save(fresh)
    return fresh
  },

  save(products: Product[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  },

  insert(product: Product): Product[] {
    const products = this.list()
    const next = [...products, product]
    this.save(next)
    return next
  },

  update(id: string, patch: Partial<Product>): Product[] {
    const products = this.list()
    const next = products.map((p) => (p.id === id ? { ...p, ...patch } : p))
    this.save(next)
    return next
  },

  remove(id: string): Product[] {
    const products = this.list()
    const next = products.filter((p) => p.id !== id)
    this.save(next)
    return next
  },

  reset(): Product[] {
    const fresh = seed()
    this.save(fresh)
    return fresh
  },
}
