import api, { unwrapData } from '../../../shared/lib/api'

export interface LoyaltyTier {
  id: string
  name: string
  min_point: number
  voucher_id?: string
  created_at?: string
  updated_at?: string
}

export const loyaltyService = {
  async getTiers(): Promise<LoyaltyTier[]> {
    const res = await api.get<{ success: boolean; message: string; data?: LoyaltyTier[] }>('/ecommerce/loyalties')
    const data = unwrapData<LoyaltyTier[]>(res.data as unknown as { success: boolean; message: string; data?: LoyaltyTier[] }) ?? res.data.data ?? []
    return Array.isArray(data) ? data : []
  },

  async getTier(id: string): Promise<LoyaltyTier | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: LoyaltyTier }>(`/ecommerce/loyalties/${id}`)
      return unwrapData<LoyaltyTier>(res.data as unknown as { success: boolean; message: string; data?: LoyaltyTier }) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  resolveTier(tiers: LoyaltyTier[], points: number, loyaltyId?: string): LoyaltyTier | null {
    if (loyaltyId) {
      const byId = tiers.find((tier) => tier.id === loyaltyId)
      if (byId) return byId
    }
    return [...tiers]
      .filter((tier) => tier.min_point <= points)
      .sort((a, b) => b.min_point - a.min_point)[0] ?? tiers[0] ?? null
  },

  nextTier(tiers: LoyaltyTier[], points: number): LoyaltyTier | null {
    return [...tiers]
      .filter((tier) => tier.min_point > points)
      .sort((a, b) => a.min_point - b.min_point)[0] ?? null
  },
}
