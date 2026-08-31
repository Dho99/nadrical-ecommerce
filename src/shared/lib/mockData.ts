import { unsplashUrl } from '../utils/unsplash'

export interface MockProduct {
  uuid: string
  sku: string
  name: string
  description: string
  price: string
  original_price?: string
  discount_percent?: number
  stock: number
  average_rating?: number
  category_uuid: string
  image: string
  is_featured?: boolean
  badge?: string
  created_at: string
}

export interface MockProductCategory {
  uuid: string
  name: string
}

export interface MockCartItem {
  uuid: string
  product_uuid: string
  quantity: number
  total_price: string
}

export interface MockOrderItem {
  uuid: string
  order_uuid: string
  product_uuid: string
  product_name: string
  sku: string
  quantity: number
  price: string
  total: string
  created_at: string
  updated_at: string
}

export interface MockOrder {
  uuid: string
  order_number: string
  account_uuid: string
  recipient_name: string
  address: string
  phone: string
  city: string
  shipping_courier: string
  order_status: string
  subtotal: number
  shipping_cost: number
  total: number
  created_at: string
  order_items?: MockOrderItem[]
}

const now = new Date().toISOString()

export const MOCK_CATEGORIES: MockProductCategory[] = [
  { uuid: 'electronics', name: 'Electronics' },
  { uuid: 'apparel', name: 'Apparel' },
  { uuid: 'home', name: 'Home & Living' },
  { uuid: 'accessories', name: 'Accessories' },
  { uuid: 'outdoors', name: 'Outdoors' },
]

const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  MOCK_CATEGORIES.map((c) => [c.uuid, c.name]),
)

function cat(uuid: string): string {
  return CATEGORY_NAMES[uuid] ?? 'General'
}

let products: MockProduct[] = [
  {
    uuid: 'SKU-1001',
    sku: 'SKU-1001',
    name: 'Wireless Over-Ear Headphones',
    description: 'Studio-tuned wireless headphones with active noise cancelling and 30-hour battery life.',
    price: '149',
    original_price: '179',
    discount_percent: 17,
    stock: 120,
    average_rating: 4.8,
    category_uuid: 'electronics',
    image: unsplashUrl('photo-1505740420928-5e560c06d30e'),
    is_featured: true,
    badge: 'BEST SELLER',
    created_at: now,
  },
  {
    uuid: 'SKU-1002',
    sku: 'SKU-1002',
    name: 'Minimal Smart Watch 42mm',
    description: 'Everyday smartwatch with always-on display, heart-rate tracking and five-day battery life.',
    price: '229',
    stock: 64,
    average_rating: 4.6,
    category_uuid: 'electronics',
    image: unsplashUrl('photo-1523275335684-37898b6baf30'),
    is_featured: true,
    created_at: now,
  },
  {
    uuid: 'SKU-1003',
    sku: 'SKU-1003',
    name: 'Compact Mirrorless Camera',
    description: '24 MP mirrorless body with 4K video, in-body stabilization and a compact kit lens.',
    price: '649',
    stock: 18,
    average_rating: 4.9,
    category_uuid: 'electronics',
    image: unsplashUrl('photo-1526170375885-4d8ecf77b99f'),
    badge: 'NEW',
    created_at: now,
  },
  {
    uuid: 'SKU-1004',
    sku: 'SKU-1004',
    name: 'True Wireless Earbuds',
    description: 'Pocket-charging case, punchy bass, and clear calls with four-mic noise handling.',
    price: '89',
    stock: 210,
    average_rating: 4.5,
    category_uuid: 'electronics',
    image: unsplashUrl('photo-1600294037681-c80b4cb5b434'),
    created_at: now,
  },
  {
    uuid: 'SKU-2001',
    sku: 'SKU-2001',
    name: 'Oversized Fleece Hoodie',
    description: 'Heavyweight brushed-fleece hoodie with a relaxed drop-shoulder fit.',
    price: '65',
    stock: 95,
    average_rating: 4.7,
    category_uuid: 'apparel',
    image: unsplashUrl('photo-1556821840-3a63f95609a7'),
    is_featured: true,
    created_at: now,
  },
  {
    uuid: 'SKU-2002',
    sku: 'SKU-2002',
    name: 'Organic Cotton Tee',
    description: 'Everyday crew-neck tee in soft organic cotton with a straight hem.',
    price: '28',
    original_price: '34',
    discount_percent: 18,
    stock: 320,
    average_rating: 4.4,
    category_uuid: 'apparel',
    image: unsplashUrl('photo-1576566588028-4147f3842f27'),
    badge: 'SALE',
    created_at: now,
  },
  {
    uuid: 'SKU-2003',
    sku: 'SKU-2003',
    name: 'Court Sneakers',
    description: 'Clean leather court sneakers with a cushioned insole and gum sole.',
    price: '120',
    stock: 42,
    average_rating: 4.6,
    category_uuid: 'apparel',
    image: unsplashUrl('photo-1542291026-7eec264c27ff'),
    created_at: now,
  },
  {
    uuid: 'SKU-3001',
    sku: 'SKU-3001',
    name: 'Architect Desk Lamp',
    description: 'Dimmable LED desk lamp with a sculptural aluminum arm and USB-C port.',
    price: '79',
    stock: 55,
    average_rating: 4.5,
    category_uuid: 'home',
    image: unsplashUrl('photo-1507473885765-e6ed057f782c'),
    created_at: now,
  },
  {
    uuid: 'SKU-3002',
    sku: 'SKU-3002',
    name: 'Ceramic Table Vase',
    description: 'Hand-glazed ceramic vase in a matte finish, made for dried or fresh stems.',
    price: '42',
    stock: 88,
    average_rating: 4.3,
    category_uuid: 'home',
    image: unsplashUrl('photo-1578500494198-246f612d3b3d'),
    created_at: now,
  },
  {
    uuid: 'SKU-3003',
    sku: 'SKU-3003',
    name: 'Woven Throw Blanket',
    description: 'Chunky-knit throw in recycled cotton-blend yarn, stonewashed for softness.',
    price: '55',
    stock: 70,
    average_rating: 4.7,
    category_uuid: 'home',
    image: unsplashUrl('photo-1580301762395-83ce84d90bc7'),
    created_at: now,
  },
  {
    uuid: 'SKU-4001',
    sku: 'SKU-4001',
    name: 'Leather Weekender Tote',
    description: 'Full-grain leather tote with an interior laptop sleeve and brass hardware.',
    price: '95',
    stock: 36,
    average_rating: 4.8,
    category_uuid: 'accessories',
    image: unsplashUrl('photo-1548036328-c9fa89d128fa'),
    created_at: now,
  },
  {
    uuid: 'SKU-4002',
    sku: 'SKU-4002',
    name: 'Polarized Sunglasses',
    description: 'Lightweight polarized frames with UV400 lenses and a hard case.',
    price: '38',
    stock: 150,
    average_rating: 4.4,
    category_uuid: 'accessories',
    image: unsplashUrl('photo-1511499767150-a48a237f0083'),
    created_at: now,
  },
  {
    uuid: 'SKU-4003',
    sku: 'SKU-4003',
    name: 'Roll-Top Travel Backpack',
    description: 'Water-resistant roll-top backpack with 22 L capacity and padded laptop sleeve.',
    price: '110',
    stock: 48,
    average_rating: 4.6,
    category_uuid: 'accessories',
    image: unsplashUrl('photo-1553062407-98eeb64c6a62'),
    created_at: now,
  },
  {
    uuid: 'SKU-5001',
    sku: 'SKU-5001',
    name: '4-Person Dome Tent',
    description: 'Waterproof dome tent with a quick-pitch design, vestibule and mesh roof.',
    price: '180',
    stock: 25,
    average_rating: 4.7,
    category_uuid: 'outdoors',
    image: unsplashUrl('photo-1478131143081-80f7f84ca84d'),
    is_featured: true,
    created_at: now,
  },
  {
    uuid: 'SKU-5002',
    sku: 'SKU-5002',
    name: 'Rechargeable Camping Lantern',
    description: 'Collapsible lantern with warm 360-degree light and USB-C rechargeable battery.',
    price: '45',
    stock: 73,
    average_rating: 4.5,
    category_uuid: 'outdoors',
    image: unsplashUrl('photo-1571508601891-ca5e7a713859'),
    badge: 'NEW',
    created_at: now,
  },
  {
    uuid: 'SKU-5003',
    sku: 'SKU-5003',
    name: 'Insulated Water Bottle',
    description: 'Double-wall stainless bottle keeps drinks cold 24 hours or hot 12 hours.',
    price: '24',
    stock: 260,
    average_rating: 4.6,
    category_uuid: 'outdoors',
    image: unsplashUrl('photo-1602143407151-7111542de6e8'),
    created_at: now,
  },
]

let cart: MockCartItem[] = []

let orders: MockOrder[] = []

function seedOrders(): MockOrder[] {
  const seed: MockOrder[] = []
  const pick = (idx: number): MockProduct => products[idx % products.length]
  const refs: Array<[number, number]> = [
    [0, 2],
    [4, 1],
    [13, 1],
  ]
  refs.forEach(([pi, qty], i) => {
    const p = pick(pi)
    const subtotal = Number(p.price) * qty
    const shipping_cost = subtotal >= 75 ? 0 : 8
    const uuid = `ord-mock-${i + 1}`
    const created = new Date(Date.now() - (i + 1) * 3 * 86400000).toISOString()
    seed.push({
      uuid,
      order_number: `ORD-MOCK-${String(1000 + i)}`,
      account_uuid: 'mock-user',
      recipient_name: 'Mock Customer',
      address: 'Jl. Contoh No. 12',
      phone: '+62 812 0000 0000',
      city: 'Jakarta',
      shipping_courier: 'standard',
      order_status: i === 0 ? 'completed' : i === 1 ? 'processing' : 'pending_payment',
      subtotal,
      shipping_cost,
      total: subtotal + shipping_cost,
      created_at: created,
      order_items: [
        {
          uuid: `ord-mock-${i + 1}-item`,
          order_uuid: uuid,
          product_uuid: p.uuid,
          product_name: p.name,
          sku: p.sku,
          quantity: qty,
          price: p.price,
          total: String(subtotal),
          created_at: created,
          updated_at: created,
        },
      ],
    })
  })
  return seed
}

export const mockData = {
  get categories(): MockProductCategory[] {
    return MOCK_CATEGORIES
  },

  get products(): MockProduct[] {
    return products
  },

  get cart(): MockCartItem[] {
    return cart
  },

  get orders(): MockOrder[] {
    if (orders.length === 0) orders = seedOrders()
    return orders
  },

  resetCart(): void {
    cart = []
  },

  resetOrders(): void {
    orders = []
  },

  productByUuid(uuid: string): MockProduct | undefined {
    return products.find((p) => p.uuid === uuid)
  },

  categoryName(uuid: string): string {
    return cat(uuid)
  },

  createProduct(data: Partial<MockProduct> & { name: string }): MockProduct {
    const product: MockProduct = {
      uuid: `SKU-${String(6000 + products.length)}`,
      sku: data.sku ?? `SKU-${String(6000 + products.length)}`,
      name: data.name,
      description: data.description ?? '',
      price: String(data.price ?? 0),
      stock: data.stock ?? 0,
      category_uuid: data.category_uuid ?? 'electronics',
      image: data.image ?? unsplashUrl('photo-1523275335684-37898b6baf30'),
      is_featured: data.is_featured ?? false,
      created_at: new Date().toISOString(),
    }
    products = [product, ...products]
    return product
  },

  updateProduct(uuid: string, patch: Partial<MockProduct>): MockProduct | null {
    const found = this.productByUuid(uuid)
    if (!found) return null
    const updated: MockProduct = { ...found, ...patch }
    products = products.map((p) => (p.uuid === uuid ? updated : p))
    return updated
  },

  deleteProduct(uuid: string): void {
    products = products.filter((p) => p.uuid !== uuid)
  },
}
