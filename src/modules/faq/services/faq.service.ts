import api from '../../../shared/lib/api'

export interface FAQ {
  uuid: string
  question: string
  answer: string
  category?: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const faqService = {
  async list(): Promise<FAQ[]> {
    const res = await api.get<FAQ[]>('/cms/faqs')
    return (res.data as unknown as FAQ[]) ?? []
  },

  async getById(id: string): Promise<FAQ | null> {
    try {
      const res = await api.get<FAQ>(`/cms/faqs/${id}`)
      return (res.data as unknown as FAQ) ?? null
    } catch {
      return null
    }
  },

  async getByCategory(category: string): Promise<FAQ[]> {
    const res = await api.get<FAQ[]>(`/cms/faqs/category/${category}`)
    return (res.data as unknown as FAQ[]) ?? []
  },
}
