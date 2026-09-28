import api from '../../../shared/lib/api'
import { formatPrice } from '../../../shared/utils/format'
import type { Voucher } from '../types/voucher.type'

export const voucherService = {
  async list(): Promise<Voucher[]> {
    const res = await api.get<Voucher[]>('/ecommerce/vouchers/active')
    return (res.data as unknown as Voucher[]) ?? []
  },

  async get(code: string): Promise<Voucher | null> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) return null
    try {
      const res = await api.get<Voucher>(`/ecommerce/vouchers/code/${normalized}`)
      return (res.data as unknown as Voucher) ?? null
    } catch {
      return null
    }
  },

  async create(voucher: Voucher): Promise<Voucher> {
    const res = await api.post<Voucher>('/ecommerce/vouchers', voucher)
    return (res.data as unknown as Voucher)
  },

  async update(id: string, patch: Partial<Voucher>): Promise<Voucher> {
    const res = await api.put<Voucher>(`/ecommerce/vouchers/${id}`, patch)
    return (res.data as unknown as Voucher)
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/ecommerce/vouchers/${id}`)
  },

  async reset(): Promise<void> {
    // No-op for API‑backed service – caller can re‑fetch list
  },

  async validate(code: string, subtotal: number): Promise<Voucher> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) throw new Error('Enter voucher code')
    // First try backend validation endpoint
    try {
      const res = await api.post<Record<string, unknown>>(`/ecommerce/vouchers/validate`, {
        code: normalized,
        order_total: subtotal,
      })
      const data = (res.data as Record<string, unknown>)?.data ?? (res.data as unknown as Voucher)
      if (data && (data as Voucher).code) return data as Voucher
    } catch {
      // ignore and fallback to local mock (if any)
    }
    // Fallback: fetch voucher by code and perform client‑side checks
    const voucher = await this.get(normalized)
    if (!voucher) throw new Error('Kode voucher tidak ditemukan')
    if (voucher.active === false) throw new Error('Voucher tidak aktif')
    if (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) {
      throw new Error('Voucher sudah kedaluwarsa')
    }
    if (voucher.min_subtotal !== undefined && subtotal < voucher.min_subtotal) {
      throw new Error(`Minimal belanja ${formatPrice(voucher.min_subtotal)} diperlukan untuk voucher ini`)
    }
    return voucher
  },

  calcDiscount(voucher: Voucher, subtotal: number, shipping: number): number {
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
  },
}
