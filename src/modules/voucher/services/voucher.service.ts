import api, { getErrorMessage, unwrapData } from '../../../shared/lib/api'
import { formatPrice } from '../../../shared/utils/format'
import type { Voucher } from '../types/voucher.type'

export const voucherService = {
  async list(): Promise<Voucher[]> {
    const res = await api.get<{ success: boolean; message: string; data?: Voucher[] }>('/ecommerce/vouchers/active')
    return unwrapData<Voucher[]>(res.data as unknown as { success: boolean; message: string; data?: Voucher[] }) ?? res.data.data ?? []
  },

  async get(code: string): Promise<Voucher | null> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) return null
    try {
      const res = await api.get<{ success: boolean; message: string; data?: Voucher }>(`/ecommerce/vouchers/code/${normalized}`)
      return unwrapData<Voucher>(res.data as unknown as { success: boolean; message: string; data?: Voucher }) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  async create(voucher: Voucher): Promise<Voucher> {
    const res = await api.post<{ success: boolean; message: string; data?: Voucher }>('/ecommerce/vouchers', voucher)
    const data = unwrapData<Voucher>(res.data as unknown as { success: boolean; message: string; data?: Voucher }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to create voucher')
    return data
  },

  async update(id: string, patch: Partial<Voucher>): Promise<Voucher> {
    const res = await api.put<{ success: boolean; message: string; data?: Voucher }>(`/ecommerce/vouchers/${id}`, patch)
    const data = unwrapData<Voucher>(res.data as unknown as { success: boolean; message: string; data?: Voucher }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to update voucher')
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/ecommerce/vouchers/${id}`)
  },

  async reset(): Promise<void> {
    throw new Error('reset tidak tersedia di BE mode')
  },

  async validate(code: string, subtotal: number): Promise<Voucher> {
    const normalized = code.trim().toUpperCase()
    if (!normalized) throw new Error('Enter voucher code')
    try {
      const res = await api.post<{ success: boolean; message: string; data?: Voucher & { voucher?: Voucher } }>(`/ecommerce/vouchers/validate`, {
        code: normalized,
        order_total: subtotal,
      })
      const raw = unwrapData<Voucher & { voucher?: Voucher }>(res.data as unknown as { success: boolean; message: string; data?: Voucher }) ?? res.data.data
      const voucher = (raw as Voucher & { voucher?: Voucher })?.voucher ?? raw
      if (voucher && (voucher as Voucher).code) return voucher as Voucher
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
