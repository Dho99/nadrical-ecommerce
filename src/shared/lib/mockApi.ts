import { mockData, type MockCartItem, type MockOrder, type MockProduct } from './mockData'

export interface MockRequest {
  method: string
  path: string
  params?: Record<string, string>
  body?: unknown
}

export interface MockResponse {
  success: boolean
  message: string
  data: unknown
}

const MOCK_DELAY_MS = 140

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
}

function ok(data: unknown): MockResponse {
  return { success: true, message: 'Mock OK', data }
}

function match(parts: string[], pattern: string[]): Record<string, string> | null {
  if (parts.length !== pattern.length) return null
  const vars: Record<string, string> = {}
  for (let i = 0; i < parts.length; i++) {
    if (pattern[i].startsWith(':')) {
      vars[pattern[i].slice(1)] = decodeURIComponent(parts[i])
    } else if (pattern[i] !== parts[i]) {
      return null
    }
  }
  return vars
}

function sortProducts(list: MockProduct[], sort: string | undefined): MockProduct[] {
  const sorted = [...list]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => Number(a.price) - Number(b.price))
    case 'price-desc':
      return sorted.sort((a, b) => Number(b.price) - Number(a.price))
    case 'stock':
      return sorted.sort((a, b) => b.stock - a.stock)
    case 'featured':
    default:
      return sorted.sort((a, b) => Number(b.is_featured ?? false) - Number(a.is_featured ?? false))
  }
}

function filterProducts(params: Record<string, string> | undefined): MockProduct[] {
  let list = [...mockData.products]
  const search = params?.search?.trim().toLowerCase()
  const category = params?.category_uuid
  if (category && category !== 'all') list = list.filter((p) => p.category_uuid === category)
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search),
    )
  }
  return sortProducts(list, params?.sort)
}

function paginate(list: MockProduct[], page: number, limit: number) {
  const total = list.length
  const start = (page - 1) * limit
  const items = list.slice(start, start + limit)
  return {
    items,
    meta: { total, per_page: limit, current_page: page },
  }
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

let mockAkun: { uuid: string; email: string; username: string; roles: string[] } = {
  uuid: 'mock-user',
  email: 'mock@example.com',
  username: 'Mock',
  roles: ['user'],
}

function roleFor(email: string): string[] {
  return email.toLowerCase().includes('admin') ? ['admin'] : ['user']
}

function handleProducts(req: MockRequest): MockResponse {
  const parts = req.path.split('?')[0].split('/').filter(Boolean)
  const vars = match(parts, ['ecommerce', 'products'])

  if (vars) {
    if (req.method === 'GET') {
      const page = Math.max(1, Number(req.params?.page) || 1)
      const limit = Math.max(1, Number(req.params?.limit) || 12)
      const list = filterProducts(req.params)
      return ok(paginate(list, page, limit))
    }
    if (req.method === 'POST') {
      const body = (req.body ?? {}) as Partial<MockProduct>
      return ok({ item: mockData.createProduct(body as Partial<MockProduct> & { name: string }) })
    }
  }

  const varsId = match(parts, ['ecommerce', 'products', ':id'])
  if (varsId) {
    const id = varsId.id
    if (req.method === 'GET') {
      const product = mockData.productByUuid(id)
      return ok({ item: product ?? null })
    }
    if (req.method === 'PUT') {
      const updated = mockData.updateProduct(id, (req.body ?? {}) as Partial<MockProduct>)
      return ok({ item: updated ?? null })
    }
    if (req.method === 'DELETE') {
      mockData.deleteProduct(id)
      return ok(null)
    }
  }

  throw new Error(`Mock: unhandled ${req.method} ${req.path}`)
}

function handleCategories(req: MockRequest): MockResponse {
  const parts = req.path.split('?')[0].split('/').filter(Boolean)
  if (match(parts, ['ecommerce', 'categories']) && req.method === 'GET') {
    return ok({ items: mockData.categories })
  }
  throw new Error(`Mock: unhandled ${req.method} ${req.path}`)
}

function handleCart(req: MockRequest): MockResponse {
  const parts = req.path.split('?')[0].split('/').filter(Boolean)

  if (match(parts, ['ecommerce', 'cart'])) {
    if (req.method === 'GET') {
      return ok({ items: mockData.cart })
    }
    if (req.method === 'POST') {
      const body = (req.body ?? {}) as { product_uuid?: string; quantity?: number }
      const product = body.product_uuid ? mockData.productByUuid(body.product_uuid) : undefined
      const existing = body.product_uuid
        ? mockData.cart.find((c) => c.product_uuid === body.product_uuid)
        : undefined
      if (existing) {
        const updated: MockCartItem = {
          ...existing,
          quantity: existing.quantity + (Number(body.quantity) || 1),
          total_price: String(Math.round(Number(existing.total_price) / existing.quantity) * (existing.quantity + (Number(body.quantity) || 1))),
        }
        mockData.cart[mockData.cart.indexOf(existing)] = updated
        return ok({ item: updated })
      }
      const item: MockCartItem = {
        uuid: makeId('cart'),
        product_uuid: body.product_uuid ?? '',
        quantity: Number(body.quantity) || 1,
        total_price: product ? String(product.price) : '0',
      }
      mockData.cart.push(item)
      return ok({ item })
    }
    if (req.method === 'DELETE') {
      mockData.resetCart()
      return ok(null)
    }
  }

  const varsItem = match(parts, ['ecommerce', 'cart', 'items', ':id'])
  if (varsItem) {
    const id = varsItem.id
    const index = mockData.cart.findIndex((c) => c.uuid === id)
    if (index === -1) throw new Error('Cart item not found')
    if (req.method === 'PUT') {
      const body = (req.body ?? {}) as { quantity?: number }
      const updated: MockCartItem = {
        ...mockData.cart[index],
        quantity: Number(body.quantity) ?? mockData.cart[index].quantity,
      }
      mockData.cart[index] = updated
      return ok({ item: updated })
    }
    if (req.method === 'DELETE') {
      mockData.cart.splice(index, 1)
      return ok(null)
    }
  }

  throw new Error(`Mock: unhandled ${req.method} ${req.path}`)
}

function handleOrders(req: MockRequest): MockResponse {
  const parts = req.path.split('?')[0].split('/').filter(Boolean)

  if (match(parts, ['ecommerce', 'orders'])) {
    if (req.method === 'GET') {
      const page = Math.max(1, Number(req.params?.page) || 1)
      const limit = Math.max(1, Number(req.params?.limit) || 10)
      const list = [...mockData.orders].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      )
      const start = (page - 1) * limit
      return ok({
        items: list.slice(start, start + limit),
        meta: { total: list.length, per_page: limit, current_page: page },
      })
    }
    if (req.method === 'POST') {
      const body = (req.body ?? {}) as {
        recipient_name?: string
        phone?: string
        address?: string
        city?: string
        shipping_courier?: string
        items?: Array<{ product_id?: string; quantity?: number; unit_price?: number }>
      }
      const items = body.items ?? []
      const subtotal = items.reduce(
        (sum, it) => sum + (Number(it.unit_price) || 0) * (Number(it.quantity) || 0),
        0,
      )
      const shipping_cost = subtotal >= 75 ? 0 : 8
      const created_at = new Date().toISOString()
      const uuid = makeId('ord')
      const order: MockOrder = {
        uuid,
        order_number: `ORD-MOCK-${String(Math.floor(1000 + Math.random() * 9000))}`,
        account_uuid: mockAkun.uuid,
        recipient_name: body.recipient_name ?? 'Mock Customer',
        address: body.address ?? '',
        phone: body.phone ?? '',
        city: body.city ?? '',
        shipping_courier: body.shipping_courier ?? 'standard',
        order_status: 'pending_payment',
        subtotal,
        shipping_cost,
        total: subtotal + shipping_cost,
        created_at,
        order_items: items.map((it, i) => {
          const product = it.product_id ? mockData.productByUuid(it.product_id) : undefined
          const qty = Number(it.quantity) || 1
          return {
            uuid: `${uuid}-item-${i}`,
            order_uuid: uuid,
            product_uuid: it.product_id ?? '',
            product_name: product?.name ?? 'Product',
            sku: product?.sku ?? '',
            quantity: qty,
            price: String(it.unit_price ?? product?.price ?? 0),
            total: String((Number(it.unit_price) || 0) * qty),
            created_at,
            updated_at: created_at,
          }
        }),
      }
      mockData.orders.push(order)
      return ok({ order })
    }
  }

  const varsId = match(parts, ['ecommerce', 'orders', ':id'])
  if (varsId) {
    const id = varsId.id
    const order = mockData.orders.find((o) => o.uuid === id)
    if (!order) throw new Error('Order not found')
    if (req.method === 'GET') return ok({ order })
  }

  const varsStatus = match(parts, ['ecommerce', 'orders', ':id', 'status'])
  if (varsStatus && req.method === 'PATCH') {
    const id = varsStatus.id
    const body = (req.body ?? {}) as { status?: string }
    const order = mockData.orders.find((o) => o.uuid === id)
    if (!order) throw new Error('Order not found')
    order.order_status = body.status ?? order.order_status
    return ok({ order })
  }

  throw new Error(`Mock: unhandled ${req.method} ${req.path}`)
}

function handleAuth(req: MockRequest): MockResponse {
  const parts = req.path.split('?')[0].split('/').filter(Boolean)
  const body = (req.body ?? {}) as Record<string, unknown>

  if (match(parts, ['auth', 'login']) && req.method === 'POST') {
    const email = String(body.email ?? body.identifier ?? 'mock@example.com')
    const username = String(body.username ?? email.split('@')[0] ?? 'Mock')
    mockAkun = { uuid: 'mock-user', email, username, roles: roleFor(email) }
    const token = `mock-token-${btoa(email)}-${Date.now()}`
    return ok({ access_token: token, token, akun: mockAkun })
  }

  if (match(parts, ['auth', 'register']) && req.method === 'POST') {
    const email = String(body.email ?? 'mock@example.com')
    const username = String(body.username ?? email.split('@')[0] ?? 'Mock')
    mockAkun = { uuid: 'mock-user', email, username, roles: roleFor(email) }
    const token = `mock-token-${btoa(email)}-${Date.now()}`
    return ok({ access_token: token, token, akun: mockAkun })
  }

  if (match(parts, ['auth', 'logout']) && req.method === 'POST') {
    return ok(null)
  }

  if (match(parts, ['auth', 'check-email']) && req.method === 'GET') {
    return ok({ exists: false })
  }

  if (match(parts, ['auth', 'profile']) && req.method === 'PUT') {
    const patch = body as { full_name?: string }
    if (patch.full_name) mockAkun = { ...mockAkun, username: patch.full_name }
    return ok({ akun: mockAkun })
  }

  throw new Error(`Mock: unhandled ${req.method} ${req.path}`)
}

export async function handleMockRequest(req: MockRequest): Promise<MockResponse> {
  await delay()
  const path = req.path
  if (path.startsWith('/ecommerce/products')) return handleProducts(req)
  if (path.startsWith('/ecommerce/categories')) return handleCategories(req)
  if (path.startsWith('/ecommerce/cart')) return handleCart(req)
  if (path.startsWith('/ecommerce/orders')) return handleOrders(req)
  if (path.startsWith('/auth/')) return handleAuth(req)
  throw new Error(`Mock: unhandled ${req.method} ${req.path}`)
}

export function resetMockOrders(): void {
  mockData.resetOrders()
}
