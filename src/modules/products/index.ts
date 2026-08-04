export { ProductCard } from './components/ProductCard'
export { ProductGrid } from './components/ProductGrid'
export { ProductFilter } from './components/ProductFilter'
export { ProductGallery } from './components/ProductGallery'
export { SpecSheet } from './components/SpecSheet'
export { useProducts } from './hooks/useProducts'
export { useInfiniteProducts } from './hooks/useInfiniteProducts'
export { useProduct } from './hooks/useProduct'
export { useCategories } from './hooks/useCategories'
export { useCatalog } from './hooks/useCatalog'
export { productService } from './services/product.service'
export { CATEGORIES, CATEGORY_LABEL, SORT_OPTIONS } from '../../shared/constants/product.constants'
export type {
  Product,
  ProductCategory,
  ProductCategoryId,
  ProductFilters,
  ProductSort,
  ProductBadge,
} from '../../shared/types/product.type'