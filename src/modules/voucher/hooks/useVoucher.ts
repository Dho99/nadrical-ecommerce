import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Voucher } from '../types/voucher.type'
import { normalizeVoucher, voucherService } from '../services/voucher.service'
import { websocketService } from '../../../shared/lib/websocket'

interface VoucherStore {
  applied: Voucher | null
  setApplied: (v: Voucher | null) => void
}

const useVoucherStore = create<VoucherStore>()(
  persist(
    (set) => ({
      applied: null,
      setApplied: (v) => set({ applied: v ? normalizeVoucher(v) : null }),
    }),
    { name: 'store-voucher-v1' },
  ),
)

export function useVoucher() {
  const appliedRaw = useVoucherStore((s) => s.applied)
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
          setApplied(fresh)
        }
      } catch {
        // keep current
      }
    }

    const unsub1 = websocketService.on('voucher_updated', revalidate)
    const unsub2 = websocketService.on('data_updated', (payload: any) => {
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
      const voucher = await voucherService.validate(code, subtotal)
      setApplied(voucher)
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
    const val = voucherService.calcDiscount(applied, sub, ship)
    return isNaN(val) ? 0 : Math.max(0, val)
  }

  return { applied, error, loading, apply, remove, discount, setError }
}
