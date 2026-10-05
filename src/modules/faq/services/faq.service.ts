import api, { unwrapData } from '../../../shared/lib/api'

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
    const res = await api.get<{ success: boolean; message: string; data?: FAQ[] }>('/cms/faqs')
    return unwrapData<FAQ[]>(res.data as unknown as { success: boolean; message: string; data?: FAQ[] }) ?? res.data.data ?? []
  },

  async getById(id: string): Promise<FAQ | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: FAQ }>(`/cms/faqs/${id}`)
      return unwrapData<FAQ>(res.data as unknown as { success: boolean; message: string; data?: FAQ }) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  async getByCategory(category: string): Promise<FAQ[]> {
    const res = await api.get<{ success: boolean; message: string; data?: FAQ[] }>('/cms/faqs', { params: { category } })
    return unwrapData<FAQ[]>(res.data as unknown as { success: boolean; message: string; data?: FAQ[] }) ?? res.data.data ?? []
  },
}
