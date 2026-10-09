import api, { unwrapData } from '../../../shared/lib/api'

export interface LoyaltyAccount {
  uuid: string
  account_uuid: string
  current_points: number
  total_earned: number
  total_redeemed: number
  current_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  points_expire_at?: string
  created_at: string
  updated_at: string
}

export interface LoyaltyTransaction {
  uuid: string
  loyalty_account_uuid: string
  transaction_type: 'earn' | 'redeem' | 'expire'
  points: number
  description?: string
  order_uuid?: string
  created_at: string
}

export const loyaltyService = {
  async getAccount(): Promise<LoyaltyAccount> {
    const res = await api.get('/ecommerce/loyalty/me')
    const data = unwrapData<LoyaltyAccount>(res.data) ?? (res.data as { data?: LoyaltyAccount })?.data
    if (!data) throw new Error('Failed to load loyalty account')
    return data
  },

  async getTransactions(): Promise<LoyaltyTransaction[]> {
    const res = await api.get('/ecommerce/loyalty/transactions')
    const data = unwrapData<LoyaltyTransaction[]>(res.data) ?? (res.data as { data?: LoyaltyTransaction[] })?.data ?? []
    return Array.isArray(data) ? data : []
  },

  async redeem(points: number, description: string): Promise<LoyaltyAccount> {
    const res = await api.post('/ecommerce/loyalty/redeem', { points, description })
    const data = unwrapData<LoyaltyAccount>(res.data) ?? (res.data as { data?: LoyaltyAccount })?.data
    if (!data) throw new Error('Failed to redeem points')
    return data
  },
}
