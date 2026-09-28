import { useEffect, useState } from 'react'
import { loyaltyService, type LoyaltyAccount, type LoyaltyTransaction } from '../services/loyalty.service'

export function useLoyalty() {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null)
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        setLoading(true)
        const [acc, txs] = await Promise.all([
          loyaltyService.getAccount(),
          loyaltyService.getTransactions(),
        ])
        setAccount(acc)
        setTransactions(txs)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load loyalty data')
        setAccount(null)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }
    fetchLoyalty()
  }, [])

  const redeem = async (points: number, description: string) => {
    try {
      const updated = await loyaltyService.redeem(points, description)
      setAccount(updated)
      const txs = await loyaltyService.getTransactions()
      setTransactions(txs)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem points')
      return false
    }
  }

  return { account, transactions, loading, error, redeem }
}
