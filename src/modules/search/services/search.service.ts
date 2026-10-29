import api, { unwrapData } from '../../../shared/lib/api'

export interface GlobalSearchItem {
  id: string
  uuid: string
  title: string
  subtitle?: string
  badge?: string
  badge_color?: string
  resource: string
  path?: string
}

export interface GlobalSearchCategory {
  category: string
  resource: string
  total: number
  has_more: boolean
  items: GlobalSearchItem[]
}

export interface GlobalSearchResponse {
  page: number
  limit: number
  total: number
  has_more: boolean
  categories: GlobalSearchCategory[]
}

export const searchService = {
  async query(term: string, limit = 5): Promise<GlobalSearchResponse> {
    const q = term.trim()
    if (q.length < 2) {
      return { page: 1, limit, total: 0, has_more: false, categories: [] }
    }
    const res = await api.get<{ success: boolean; message: string; data?: GlobalSearchResponse }>('/core/search', {
      params: { q, limit },
    })
    const data = unwrapData<GlobalSearchResponse>(res.data as unknown as { success: boolean; message: string; data?: GlobalSearchResponse }) ?? res.data.data
    return data ?? { page: 1, limit, total: 0, has_more: false, categories: [] }
  },
}
