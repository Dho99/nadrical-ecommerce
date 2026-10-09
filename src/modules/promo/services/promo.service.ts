import api, { unwrapData } from '../../../shared/lib/api'

export interface PromoDialog {
  uuid: string
  title: string
  description?: string
  image_url?: string
  cta_text?: string
  cta_link?: string
  is_active: boolean
  start_at?: string
  end_at?: string
  created_at: string
  updated_at: string
}

export const promoService = {
  async getActive(): Promise<PromoDialog[]> {
    try {
      const res = await api.get('/cms/promo-dialogs/active')
      const data = unwrapData<PromoDialog[]>(res.data) ?? (res.data as { data?: PromoDialog[] })?.data ?? []
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getById(id: string): Promise<PromoDialog | null> {
    try {
      const res = await api.get(`/cms/promo-dialogs/${id}`)
      const data = unwrapData<PromoDialog>(res.data) ?? (res.data as { data?: PromoDialog })?.data ?? null
      return data
    } catch {
      return null
    }
  },
}
