import type { ProductCategory, ProductSort } from '../types/product.type'

export const CATEGORIES: ProductCategory[] = [
  { id: 'electronics', label: 'Electronics', tagline: 'Audio, cameras, wearables' },
  { id: 'apparel', label: 'Apparel', tagline: 'Tees, hoodies, sneakers' },
  { id: 'home', label: 'Home & Living', tagline: 'Furniture, lighting, kitchen' },
  { id: 'accessories', label: 'Accessories', tagline: 'Bags, sunglasses, leather' },
  { id: 'outdoors', label: 'Outdoors', tagline: 'Tents, bottles, camping gear' },
]

export const CATEGORY_LABEL: Record<string, string> = {
  electronics: 'Electronics',
  apparel: 'Apparel',
  home: 'Home & Living',
  accessories: 'Accessories',
  outdoors: 'Outdoors',
}

export const SORT_OPTIONS: Array<{ id: ProductSort; label: string }> = [
  { id: 'featured', label: 'Featured' },
  { id: 'featured-only', label: 'Featured Only' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'stock', label: 'Best stocked' },
]
