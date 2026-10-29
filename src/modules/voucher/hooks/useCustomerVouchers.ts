import { useEffect, useState, useCallback } from 'react'
import type { CustomerVoucher, ClaimableLoyaltyVoucher } from '../types/voucher.type'
import { voucherService } from '../services/voucher.service'
import { websocketService } from '../../../shared/lib/websocket'

export function useCustomerVouchers() {
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([])
  const [claimableLoyalty, setClaimableLoyalty] = useState<ClaimableLoyaltyVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [walletRes, loyaltyRes] = await Promise.all([
        voucherService.getMyVouchers(),
        voucherService.getClaimableLoyaltyVouchers(),
      ])
      setVouchers(walletRes)
      setClaimableLoyalty(loyaltyRes)
    } catch {
      // Keep previous state on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    const handleUpdate = () => {
      fetchAll()
    }

    const unsub1 = websocketService.on('voucher_updated', handleUpdate)
    const unsub2 = websocketService.on('data_updated', (payload: any) => {
      if (!payload || payload.resource === 'vouchers' || payload.resource === 'customer_vouchers') {
        handleUpdate()
      }
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [fetchAll])

  const claim = useCallback(
    async (voucherId: string) => {
      try {
        setClaimingId(voucherId)
        await voucherService.claimLoyaltyVoucher(voucherId)
        await fetchAll()
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Gagal mengklaim voucher',
        }
      } finally {
        setClaimingId(null)
      }
    },
    [fetchAll],
  )

  return {
    vouchers,
    claimableLoyalty,
    loading,
    claimingId,
    refresh: fetchAll,
    claim,
  }
}
