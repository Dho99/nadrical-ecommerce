import api, { unwrapData, unwrapMeta } from '../../../shared/lib/api'

export interface NewsCategory {
  uuid: string
  name: string
  slug: string
  description?: string
}

export interface NewsTag {
  uuid: string
  name: string
  slug: string
}

export interface NewsItem {
  uuid: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  status?: string
  views_count?: number
  created_at?: string
  updated_at?: string
  category?: NewsCategory
  tags?: NewsTag[]
}

export interface NewsPage {
  items: NewsItem[]
  total: number
  page: number
  limit: number
}

export const newsService = {
  async list(params: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}): Promise<NewsPage> {
    const page = Math.max(1, params.page ?? 1)
    const limit = Math.max(1, Math.min(50, params.limit ?? 9))
    const query: Record<string, string | number> = { page, limit }
    if (params.search?.trim()) query.search = params.search.trim()
    if (params.category) query.category = params.category
    if (params.status) query.status = params.status
    const res = await api.get<{ success: boolean; message: string; data?: NewsItem[] }>('/cms/news', { params: query })
    const items = unwrapData<NewsItem[]>(res.data as unknown as { success: boolean; message: string; data?: NewsItem[] }) ?? res.data.data ?? []
    const meta = unwrapMeta(res.data as unknown as { meta?: { total?: number } })
    return {
      items: Array.isArray(items) ? items : [],
      total: Number(meta?.total ?? items.length),
      page,
      limit,
    }
  },

  async getBySlug(slug: string): Promise<NewsItem | null> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsItem }>(`/cms/news/slug/${encodeURIComponent(slug)}`)
    return unwrapData<NewsItem>(res.data as unknown as { success: boolean; message: string; data?: NewsItem }) ?? res.data.data ?? null
  },

  async getById(id: string): Promise<NewsItem | null> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsItem }>(`/cms/news/${encodeURIComponent(id)}`)
    return unwrapData<NewsItem>(res.data as unknown as { success: boolean; message: string; data?: NewsItem }) ?? res.data.data ?? null
  },

  async getCategories(): Promise<NewsCategory[]> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsCategory[] }>('/cms/news-categories')
    return unwrapData<NewsCategory[]>(res.data as unknown as { success: boolean; message: string; data?: NewsCategory[] }) ?? res.data.data ?? []
  },

  async getCategoryById(id: string): Promise<NewsCategory | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: NewsCategory }>(`/cms/news-categories/${id}`)
      return unwrapData<NewsCategory>(res.data as unknown as { success: boolean; message: string; data?: NewsCategory }) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  async getTagById(id: string): Promise<NewsTag | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: NewsTag }>(`/cms/news-tags/${id}`)
      return unwrapData<NewsTag>(res.data as unknown as { success: boolean; message: string; data?: NewsTag }) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  async getTags(): Promise<NewsTag[]> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsTag[] }>('/cms/news-tags')
    return unwrapData<NewsTag[]>(res.data as unknown as { success: boolean; message: string; data?: NewsTag[] }) ?? res.data.data ?? []
  },
}
