import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Voucher } from '../types/voucher.type'
import { normalizeVoucher, voucherService } from '../services/voucher.service'
import { websocketService } from '../../../shared/lib/websocket'

interface VoucherStore {
  applied: Voucher | null
  discountAmount: number
  setApplied: (v: Voucher | null, discountAmount?: number) => void
}

const useVoucherStore = create<VoucherStore>()(
  persist(
    (set) => ({
      applied: null,
      discountAmount: 0,
      setApplied: (v, discountAmount = 0) =>
        set({ applied: v ? normalizeVoucher(v) : null, discountAmount: v ? Math.max(0, discountAmount) : 0 }),
    }),
    { name: 'store-voucher-v1' },
  ),
)

export function useVoucher() {
  const appliedRaw = useVoucherStore((s) => s.applied)
  const backendDiscount = useVoucherStore((s) => s.discountAmount)
  const setApplied = useVoucherStore((s) => s.setApplied)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-revalidate applied voucher if admin updates or removes it
  useEffect(() => {
    if (!appliedRaw?.code) return
    const revalidate = async () => {
      try {
        const fresh = await voucherService.get(appliedRaw.code)
        if (!fresh || !fresh.is_active) {
          setApplied(null)
          setError('Voucher tidak lagi tersedia atau telah dinonaktifkan')
        } else {
          setApplied(fresh, useVoucherStore.getState().discountAmount)
        }
      } catch {
        // keep current
      }
    }

    const unsub1 = websocketService.on('voucher_updated', revalidate)
    const unsub2 = websocketService.on('data_updated', (payload: { resource?: string } | null) => {
      if (!payload || payload.resource === 'vouchers') {
        revalidate()
      }
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [appliedRaw?.code, setApplied])

  const applied = appliedRaw ? normalizeVoucher(appliedRaw) : null

  const apply = async (code: string, subtotal: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const [voucher, application] = await Promise.all([
        voucherService.validate(code, subtotal),
        voucherService.apply(code, subtotal),
      ])
      if (!application.valid) {
        throw new Error(application.message || 'Voucher tidak dapat digunakan')
      }
      setApplied(voucher, application.discount_amount)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid voucher')
      return false
    } finally {
      setLoading(false)
    }
  }

  const remove = () => {
    setApplied(null)
    setError(null)
  }

  const discount = (subtotal: number, shipping: number): number => {
    if (!applied) return 0
    const sub = Math.max(0, Number(subtotal) || 0)
    const ship = Math.max(0, Number(shipping) || 0)
    if (applied.min_subtotal !== undefined && sub < applied.min_subtotal) return 0
    if (backendDiscount > 0) return Math.min(sub, backendDiscount)
    const val = voucherService.calcDiscount(applied, sub, ship)
    return isNaN(val) ? 0 : Math.max(0, val)
  }

  return { applied, error, loading, apply, remove, discount, setError }
}
