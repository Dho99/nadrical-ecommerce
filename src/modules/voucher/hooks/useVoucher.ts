import { useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Voucher } from '../types/voucher.type'
import { voucherService } from '../services/voucher.service'

interface VoucherStore {
  applied: Voucher | null
  setApplied: (v: Voucher | null) => void
}

const useVoucherStore = create<VoucherStore>()(
  persist(
    (set) => ({
      applied: null,
      setApplied: (v) => set({ applied: v }),
    }),
    { name: 'store-voucher-v1' },
  ),
)

export function useVoucher() {
  const applied = useVoucherStore((s) => s.applied)
  const setApplied = useVoucherStore((s) => s.setApplied)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    if (applied.min_subtotal !== undefined && subtotal < applied.min_subtotal) return 0
    return voucherService.calcDiscount(applied, subtotal, shipping)
  }

  return { applied, error, loading, apply, remove, discount, setError }
}
