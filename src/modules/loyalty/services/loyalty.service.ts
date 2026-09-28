import api from '../../../shared/lib/api'

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
    const res = await api.get<LoyaltyAccount>('/ecommerce/loyalty/me')
    return (res.data as unknown as LoyaltyAccount)
  },

  async getTransactions(): Promise<LoyaltyTransaction[]> {
    const res = await api.get<LoyaltyTransaction[]>('/ecommerce/loyalty/transactions')
    return (res.data as unknown as LoyaltyTransaction[]) ?? []
  },

  async redeem(points: number, description: string): Promise<LoyaltyAccount> {
    const res = await api.post<LoyaltyAccount>('/ecommerce/loyalty/redeem', { points, description })
    return (res.data as unknown as LoyaltyAccount)
  },
}
