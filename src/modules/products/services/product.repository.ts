import type { Product } from '../types/product.type'
import { PRODUCT_CATALOG } from './mock-data'
import type {
  DbProduct,
  DbProductVariant,
  DbProductSpec,
  DbProductImage,
} from '../../../shared/types/database.type'

const PRODUCTS_KEY = 'db-products-v3'
const VARIANTS_KEY = 'db-product-variants-v3'
const SPECS_KEY = 'db-product-specs-v3'
const IMAGES_KEY = 'db-product-images-v3'

interface ProductDb {
  products: DbProduct[]
  variants: DbProductVariant[]
  specs: DbProductSpec[]
  images: DbProductImage[]
}

function seed(): ProductDb {
  const products: DbProduct[] = []
  const variants: DbProductVariant[] = []
  const specs: DbProductSpec[] = []
  const images: DbProductImage[] = []

  PRODUCT_CATALOG.forEach((p) => {
    products.push({
      id: p.id,
      category_id: p.category_id,
      sku: p.sku,
      name: p.name,
      base_price: p.base_price,
      stock: p.stock,
      cover_image_url: p.cover_image_url,
      summary: p.summary,
      is_featured: p.is_featured || false,
      is_preorder: (p as Product).is_preorder || false,
      preorder_eta: (p as Product).preorder_eta,
      preorder_deposit: (p as Product).preorder_deposit,
      status: 'published',
      created_at: new Date().toISOString(),
    })

    p.specs.forEach((s, idx) => {
      specs.push({
        id: `spec-${p.id}-${idx}`,
        product_id: p.id,
        spec_name: s.spec_name,
        spec_value: s.spec_value,
        created_at: new Date().toISOString(),
      })
    })

    if (p.variants) {
      p.variants.forEach((v) => {
        variants.push({
          id: v.id,
          product_id: p.id,
          variant_sku: v.id,
          variant_name: v.variant_name,
          price_delta: v.price_delta,
          stock: v.stock,
          is_active: true,
          created_at: new Date().toISOString(),
        })
      })
    }
  })

  return { products, variants, specs, images }
}

function loadDb(): ProductDb {
  try {
    const rawP = localStorage.getItem(PRODUCTS_KEY)
    if (rawP !== null) {
      const products = JSON.parse(rawP) as DbProduct[]
      const variants = JSON.parse(localStorage.getItem(VARIANTS_KEY) || '[]') as DbProductVariant[]
      const specs = JSON.parse(localStorage.getItem(SPECS_KEY) || '[]') as DbProductSpec[]
      const images = JSON.parse(localStorage.getItem(IMAGES_KEY) || '[]') as DbProductImage[]
      return { products, variants, specs, images }
    }
  } catch {
    // fall through
  }
  const fresh = seed()
  saveDb(fresh.products, fresh.variants, fresh.specs, fresh.images)
  return fresh
}

function saveDb(
  products: DbProduct[],
  variants: DbProductVariant[],
  specs: DbProductSpec[],
  images: DbProductImage[],
): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  localStorage.setItem(VARIANTS_KEY, JSON.stringify(variants))
  localStorage.setItem(SPECS_KEY, JSON.stringify(specs))
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images))
}

export const productRepository = {
  list(): Product[] {
    const db = loadDb()
    return db.products.map((p) => {
      const pSpecs = db.specs
        .filter((s) => s.product_id === p.id)
        .map((s) => ({ spec_name: s.spec_name, spec_value: s.spec_value }))
      const pVariants = db.variants
        .filter((v) => v.product_id === p.id)
        .map((v) => ({
          id: v.id,
          variant_name: v.variant_name,
          price_delta: v.price_delta || 0,
          stock: v.stock || 0,
        }))
      const hash = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      return {
        id: p.id,
        sku: p.sku || p.id,
        name: p.name,
        category_id: p.category_id as Product['category_id'],
        base_price: p.base_price,
        stock: p.stock || 0,
        cover_image_url: p.cover_image_url || '',
        is_featured: p.is_featured,
        is_preorder: (p as unknown as { is_preorder?: boolean }).is_preorder,
        preorder_eta: (p as unknown as { preorder_eta?: string }).preorder_eta,
        preorder_deposit: (p as unknown as { preorder_deposit?: number }).preorder_deposit,
        summary: p.summary || '',
        specs: pSpecs,
        variants: pVariants.length > 0 ? pVariants : undefined,
        rating: 4.2 + ((hash % 7) * 0.1),
        review_count: 12 + (hash % 229),
      }
    })
  },

  save(products: Product[]): void {
    const dbProducts: DbProduct[] = []
    const dbVariants: DbProductVariant[] = []
    const dbSpecs: DbProductSpec[] = []
    const dbImages: DbProductImage[] = []

    products.forEach((p) => {
      dbProducts.push({
        id: p.id,
        category_id: p.category_id,
        sku: p.sku,
        name: p.name,
        base_price: p.base_price,
        stock: p.stock,
        cover_image_url: p.cover_image_url,
        summary: p.summary,
        is_featured: p.is_featured || false,
        is_preorder: p.is_preorder || false,
        preorder_eta: p.preorder_eta,
        preorder_deposit: p.preorder_deposit,
        status: 'published',
      })

      p.specs.forEach((s, idx) => {
        dbSpecs.push({
          id: `spec-${p.id}-${idx}`,
          product_id: p.id,
          spec_name: s.spec_name,
          spec_value: s.spec_value,
        })
      })

      if (p.variants) {
        p.variants.forEach((v) => {
          dbVariants.push({
            id: v.id,
            product_id: p.id,
            variant_sku: v.id,
            variant_name: v.variant_name,
            price_delta: v.price_delta,
            stock: v.stock,
            is_active: true,
          })
        })
      }
    })

    saveDb(dbProducts, dbVariants, dbSpecs, dbImages)
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
    saveDb(fresh.products, fresh.variants, fresh.specs, fresh.images)
    return this.list()
  },
}
