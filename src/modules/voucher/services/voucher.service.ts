import api, { getErrorMessage, unwrapData } from '../../../shared/lib/api'
import { formatPrice } from '../../../shared/utils/format'
import type { Voucher, CustomerVoucher, ClaimableLoyaltyVoucher } from '../types/voucher.type'

export function normalizeVoucher(raw: unknown): Voucher | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>

  // Determine type: BE sends 'percentage' | 'nominal', FE uses 'percent' | 'fixed'
  const rawType = String(item.type ?? item.voucher_type ?? '').toLowerCase()
  const type: 'percent' | 'fixed' =
    rawType === 'percent' || rawType === 'percentage' ? 'percent' : 'fixed'

  // Numeric value: BE sends discount_value, FE uses value
  const rawVal = item.value ?? item.discount_value
  const value = typeof rawVal === 'number' ? rawVal : Number(rawVal) || 0

  // Minimum subtotal
  const rawMin = item.min_subtotal ?? item.min_purchase_amount
  const min_subtotal =
    rawMin !== undefined && rawMin !== null
      ? typeof rawMin === 'number'
        ? rawMin
        : Number(rawMin) || 0
      : undefined

  // Maximum discount
  const rawMax = item.max_discount ?? item.max_discount_amount
  const max_discount =
    rawMax !== undefined && rawMax !== null
      ? typeof rawMax === 'number'
        ? rawMax
        : Number(rawMax) || undefined
      : undefined

  // Active status
  const active =
    typeof item.active === 'boolean'
      ? item.active
      : typeof item.is_active === 'boolean'
        ? item.is_active
        : true

  // Expiration
  const expires_at =
    typeof item.expires_at === 'string'
      ? item.expires_at
      : typeof item.valid_to_date === 'string'
        ? item.valid_to_date
        : undefined

  const rawDesc = typeof item.description === 'string' ? item.description.trim() : ''
  const description = rawDesc !== ''
    ? rawDesc
    : type === 'percent'
      ? `Diskon ${value}%`
      : `Potongan ${formatPrice(value)}`

  return {
    code: String(item.code ?? '').trim().toUpperCase(),
    type,
    value,
    min_subtotal,
    max_discount,
    description,
    expires_at,
    active,
    uuid: typeof item.uuid === 'string' ? item.uuid : undefined,
    voucher_type: typeof item.voucher_type === 'string' ? item.voucher_type : (type === 'percent' ? 'percentage' : 'nominal'),
    discount_value: value,
    max_discount_amount: max_discount ?? null,
    min_purchase_amount: min_subtotal ?? null,
    valid_from_date: typeof item.valid_from_date === 'string' ? item.valid_from_date : undefined,
    valid_to_date: expires_at,
    is_active: active,
    target_type: typeof item.target_type === 'string' ? (item.target_type as Voucher['target_type']) : 'all',
  }
}

export const voucherService = {
  async getAll(): Promise<Voucher[]> {
    const res = await api.get<{ success: boolean; message: string; data?: unknown[] }>('/ecommerce/vouchers')
    const rawList = unwrapData<unknown[]>(res.data as unknown as { success: boolean; message: string; data?: unknown[] }) ?? res.data.data ?? []
    return Array.isArray(rawList)
      ? rawList.map(normalizeVoucher).filter((v): v is Voucher => v !== null && Boolean(v.code))
      : []
  },

  async getById(id: string): Promise<Voucher | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: unknown }>(`/ecommerce/vouchers/${id}`)
      const raw = unwrapData<unknown>(res.data as unknown as { success: boolean; message: string; data?: unknown }) ?? res.data.data ?? null
      return normalizeVoucher(raw)
    } catch {
      return null
    }
  },

  async list(): Promise<Voucher[]> {
    const res = await api.get<{ success: boolean; message: string; data?: unknown[] }>('/ecommerce/vouchers/active')
    const rawList = unwrapData<unknown[]>(res.data as unknown as { success: boolean; message: string; data?: unknown[] }) ?? res.data.data ?? []
    return Array.isArray(rawList)
      ? (rawList.map(normalizeVoucher).filter((v): v is Voucher => v !== null && Boolean(v.code)))
      : []
  },

  async get(code: string): Promise<Voucher | null> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) return null
    try {
      const res = await api.get<{ success: boolean; message: string; data?: unknown }>(`/ecommerce/vouchers/code/${normalized}`)
      const raw = unwrapData<unknown>(res.data as unknown as { success: boolean; message: string; data?: unknown }) ?? res.data.data ?? null
      return normalizeVoucher(raw)
    } catch {
      return null
    }
  },

  async create(voucher: Voucher): Promise<Voucher> {
    const res = await api.post<{ success: boolean; message: string; data?: Voucher }>('/ecommerce/vouchers', voucher)
    const data = unwrapData<Voucher>(res.data as unknown as { success: boolean; message: string; data?: Voucher }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to create voucher')
    return normalizeVoucher(data) ?? voucher
  },

  async update(id: string, patch: Partial<Voucher>): Promise<Voucher> {
    const res = await api.put<{ success: boolean; message: string; data?: Voucher }>(`/ecommerce/vouchers/${id}`, patch)
    const data = unwrapData<Voucher>(res.data as unknown as { success: boolean; message: string; data?: Voucher }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to update voucher')
    return normalizeVoucher(data) ?? (patch as Voucher)
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/ecommerce/vouchers/${id}`)
  },

  async reset(): Promise<void> {
    throw new Error('reset tidak tersedia di BE mode')
  },

  async apply(code: string, subtotal: number): Promise<{ valid: boolean; discount_amount: number; final_total: number; message?: string }> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) throw new Error('Enter voucher code')
    const res = await api.post<{
      success: boolean
      message: string
      data?: { valid?: boolean; discount_amount?: number; final_total?: number; message?: string }
    }>('/ecommerce/vouchers/apply', {
      code: normalized,
      order_total: subtotal,
    })
    const data = unwrapData<{ valid?: boolean; discount_amount?: number; final_total?: number; message?: string }>(
      res.data as unknown as { success: boolean; message: string; data?: { valid?: boolean; discount_amount?: number; final_total?: number; message?: string } },
    ) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Gagal menerapkan voucher')
    return {
      valid: Boolean(data.valid),
      discount_amount: Number(data.discount_amount ?? 0),
      final_total: Number(data.final_total ?? subtotal),
      message: data.message,
    }
  },

  async validate(code: string, subtotal: number): Promise<Voucher> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) throw new Error('Enter voucher code')
    try {
      const res = await api.post<{ success: boolean; message: string; data?: unknown }>(`/ecommerce/vouchers/validate`, {
        code: normalized,
        order_total: subtotal,
      })
      const raw = unwrapData<unknown>(res.data as unknown as { success: boolean; message: string; data?: unknown }) ?? res.data.data
      const rawObj = (raw as { voucher?: unknown; valid?: boolean; message?: string })?.voucher ?? raw
      const voucher = normalizeVoucher(rawObj)
      if (voucher && voucher.code) return voucher
    } catch (e) {
      const msg = getErrorMessage(e, '')
      if (msg && !msg.includes('Unexpected')) throw new Error(msg, { cause: e })
    }
    const voucher = await this.get(normalized)
    if (!voucher) throw new Error('Kode voucher tidak ditemukan')
    if (voucher.active === false) throw new Error('Voucher tidak aktif')
    if (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) throw new Error('Voucher sudah kedaluwarsa')
    if (voucher.min_subtotal !== undefined && subtotal < voucher.min_subtotal) throw new Error(`Minimal belanja ${formatPrice(voucher.min_subtotal)} diperlukan untuk voucher ini`)
    return voucher
  },

  calcDiscount(voucherInput: Voucher | null | undefined, subtotal: number, shipping: number): number {
    if (!voucherInput) return 0
    const voucher = normalizeVoucher(voucherInput)
    if (!voucher) return 0

    const sub = Math.max(0, Number(subtotal) || 0)
    const ship = Math.max(0, Number(shipping) || 0)

    if (voucher.active === false) return 0
    if (voucher.min_subtotal !== undefined && sub < voucher.min_subtotal) return 0
    if (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) return 0
    if (voucher.code === 'FREESHIP') return ship

    if (voucher.type === 'percent') {
      let discount = (sub * voucher.value) / 100
      if (voucher.max_discount !== undefined && !isNaN(voucher.max_discount) && voucher.max_discount > 0) {
        discount = Math.min(discount, voucher.max_discount)
      }
      const finalDiscount = Math.min(Math.round(discount), sub)
      return isNaN(finalDiscount) ? 0 : Math.max(0, finalDiscount)
    }

    const finalDiscount = Math.min(voucher.value, sub)
    return isNaN(finalDiscount) ? 0 : Math.max(0, finalDiscount)
  },

  async getMyVouchers(): Promise<CustomerVoucher[]> {
    try {
      const res = await api.get<{ success: boolean; data?: unknown[] }>('/ecommerce/vouchers/my-vouchers')
      const raw = unwrapData<unknown[]>(res.data as { data?: unknown[] }) ?? res.data?.data ?? []
      if (!Array.isArray(raw)) return []
      return raw.map((entry) => {
        const item = entry as Record<string, unknown> & { voucher?: unknown }
        return {
          ...item,
          voucher: normalizeVoucher(item.voucher) as Voucher,
        } as CustomerVoucher
      })
    } catch {
      return []
    }
  },

  async getClaimableLoyaltyVouchers(): Promise<ClaimableLoyaltyVoucher[]> {
    try {
      const res = await api.get<{ success: boolean; data?: unknown[] }>('/ecommerce/vouchers/claimable-loyalty')
      const raw = unwrapData<unknown[]>(res.data as { data?: unknown[] }) ?? res.data?.data ?? []
      if (!Array.isArray(raw)) return []
      return raw.map((entry) => {
        const item = entry as Record<string, unknown> & { voucher?: unknown }
        return {
          voucher: normalizeVoucher(item.voucher) as Voucher,
          is_claimed: Boolean(item.is_claimed),
          tier_name: String(item.tier_name || ''),
        }
      })
    } catch {
      return []
    }
  },

  async claimLoyaltyVoucher(voucherId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>(`/ecommerce/vouchers/${voucherId}/claim`)
    return res.data
  },
}

