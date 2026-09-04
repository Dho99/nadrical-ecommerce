import type { ProductCategory, ProductCategoryId, ProductSort } from '../types/product.type'

export const CATEGORIES: ProductCategory[] = [
  { id: 'electronics', label: 'Electronics', tagline: 'Audio, cameras, wearables' },
  { id: 'apparel', label: 'Apparel', tagline: 'Tees, hoodies, sneakers' },
  { id: 'home', label: 'Home & Living', tagline: 'Furniture, lighting, kitchen' },
  { id: 'accessories', label: 'Accessories', tagline: 'Bags, sunglasses, leather' },
  { id: 'outdoors', label: 'Outdoors', tagline: 'Tents, bottles, camping gear' },
]
/** @deprecated Categories are now fetched from the API via `productService.getCategories()` */

export const CATEGORY_LABEL: Record<ProductCategoryId, string> = CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.id]: cat.label }),
  {} as Record<ProductCategoryId, string>,
)

export const SORT_OPTIONS: Array<{ id: ProductSort; label: string }> = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'stock', label: 'Best stocked' },
]
