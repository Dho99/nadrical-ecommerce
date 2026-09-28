import api from '../../../shared/lib/api'

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
      const res = await api.get<PromoDialog[]>('/cms/promo-dialogs/active')
      return (res.data as unknown as PromoDialog[]) ?? []
    } catch {
      return []
    }
  },

  async getById(id: string): Promise<PromoDialog | null> {
    try {
      const res = await api.get<PromoDialog>(`/cms/promo-dialogs/${id}`)
      return (res.data as unknown as PromoDialog) ?? null
    } catch {
      return null
    }
  },
}
