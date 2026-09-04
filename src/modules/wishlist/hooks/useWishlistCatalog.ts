import { useEffect, useMemo, useState } from 'react'
import { productService } from '../../products/services/product.service'
import type { Product } from '../../products/types/product.type'
import { useWishlist } from './useWishlist'

/**
 * Fetches the product catalog once and derives the wished products from the
 * wishlist ids. Safe against `set-state-in-effect`: fetches happen in async
 * callbacks, the filtered list is derived during render so it updates
 * immediately when the wishlist changes.
 */
export function useWishlistCatalog() {
  const { items } = useWishlist()
  const [catalog, setCatalog] = useState<Product[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    productService
      .getProducts()
      .then((list) => {
        if (cancelled) return
        setCatalog(list)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const idSet = useMemo(() => new Set(items.map((i) => i.product_id)), [items])

  const products = useMemo(
    () => catalog.filter((p) => idSet.has(p.id)),
    [catalog, idSet],
  )

  return { products, ready, ids: items }
}
