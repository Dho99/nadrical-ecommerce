import api from '../../../shared/lib/api'
import type { Voucher } from '../types/voucher.type'

export const VOUCHERS: Voucher[] = [
  {
    code: 'NADRICAL10',
    type: 'percent',
    value: 10,
    max_discount: 20,
    description: '10% off, max $20',
    active: true,
  },
  {
    code: 'WELCOME15',
    type: 'percent',
    value: 15,
    min_subtotal: 50,
    description: '15% off orders over $50',
    active: true,
  },
  {
    code: 'FIXED5',
    type: 'fixed',
    value: 5,
    min_subtotal: 30,
    description: '$5 off orders over $30',
    active: true,
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 0,
    description: 'Free shipping',
    active: true,
  },
]

const STORAGE_KEY = 'discounts-v1'

function load(): Voucher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Voucher[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return [...VOUCHERS]
}

function save(list: Voucher[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function all(): Voucher[] {
  return load()
}

export function findVoucher(code: string): Voucher | undefined {
  return all().find((v) => v.code === code.trim().toUpperCase())
}

export function calcDiscount(voucher: Voucher, subtotal: number, shipping: number): number {
  if (voucher.active === false) return 0
  if (voucher.min_subtotal !== undefined && subtotal < voucher.min_subtotal) return 0
  if (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) return 0
  if (voucher.code === 'FREESHIP') return shipping
  if (voucher.type === 'percent') {
    let discount = (subtotal * voucher.value) / 100
    if (voucher.max_discount !== undefined) discount = Math.min(discount, voucher.max_discount)
    return Math.min(discount, subtotal)
  }
  return Math.min(voucher.value, subtotal)
}

export const voucherService = {
  list(): Voucher[] {
    return all()
  },

  get(code: string): Voucher | null {
    return findVoucher(code) ?? null
  },

  create(voucher: Voucher): Voucher {
    const normalized = { ...voucher, code: voucher.code.trim().toUpperCase() }
    const list = all()
    if (list.some((v) => v.code === normalized.code)) throw new Error('Code already exists')
    const next = [...list, normalized]
    save(next)
    return normalized
  },

  update(code: string, patch: Partial<Voucher>): Voucher | null {
    const upper = code.trim().toUpperCase()
    const list = all()
    const idx = list.findIndex((v) => v.code === upper)
    if (idx === -1) return null
    const updated = { ...list[idx], ...patch, code: patch.code ? patch.code.trim().toUpperCase() : list[idx].code }
    list[idx] = updated
    save(list)
    return updated
  },

  remove(code: string): void {
    const upper = code.trim().toUpperCase()
    save(all().filter((v) => v.code !== upper))
  },

  reset(): void {
    save([...VOUCHERS])
  },

  async validate(code: string, subtotal: number): Promise<Voucher> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) throw new Error('Enter voucher code')

    try {
      const res = await api.get<{ success: boolean; data: Voucher }>(`/ecommerce/vouchers/${normalized}`)
      const data = (res.data as unknown as { data?: Voucher })?.data ?? (res.data as unknown as Voucher)
      if (data && (data as Voucher).code) return data as Voucher
    } catch {
      // fallback to local
    }

    const voucher = findVoucher(normalized)
    if (!voucher) throw new Error('Voucher not found')
    if (voucher.active === false) throw new Error('Voucher inactive')
    if (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) {
      throw new Error('Voucher expired')
    }
    if (voucher.min_subtotal !== undefined && subtotal < voucher.min_subtotal) {
      throw new Error(`Minimum order $${voucher.min_subtotal} required`)
    }
    return voucher
  },
}
