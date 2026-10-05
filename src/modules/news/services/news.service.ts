import api, { unwrapData } from '../../../shared/lib/api'

export interface NewsCategory {
  uuid: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

export interface NewsTag {
  uuid: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface News {
  uuid: string
  title: string
  slug: string
  content: string
  excerpt?: string
  thumbnail?: string
  category_uuid?: string
  category?: NewsCategory
  tags?: NewsTag[]
  status: 'draft' | 'published' | 'archived'
  views_count: number
  created_at: string
  updated_at: string
}

export interface NewsListResponse {
  data: News[]
  total: number
  page: number
  limit: number
}

export const newsService = {
  async list(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
  }): Promise<NewsListResponse> {
    const res = await api.get<{ success: boolean; message: string; data?: News[]; meta?: { total: number; current_page: number; per_page: number } }>('/cms/news', { params })
    const data = unwrapData<News[]>(res.data as unknown as { success: boolean; message: string; data?: News[] }) ?? res.data.data ?? []
    const meta = (res.data as unknown as { meta?: { total: number; current_page: number; per_page: number } }).meta
    return { data, total: meta?.total ?? data.length, page: meta?.current_page ?? params?.page ?? 1, limit: meta?.per_page ?? params?.limit ?? data.length }
  },

  async getById(id: string): Promise<News> {
    const res = await api.get<{ success: boolean; message: string; data?: News }>(`/cms/news/${id}`)
    const data = unwrapData<News>(res.data as unknown as { success: boolean; message: string; data?: News }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'News not found')
    return data
  },

  async getBySlug(slug: string): Promise<News> {
    const res = await api.get<{ success: boolean; message: string; data?: News }>(`/cms/news/slug/${slug}`)
    const data = unwrapData<News>(res.data as unknown as { success: boolean; message: string; data?: News }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'News not found')
    return data
  },

  async getCategories(): Promise<NewsCategory[]> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsCategory[] }>('/cms/news-categories')
    return unwrapData<NewsCategory[]>(res.data as unknown as { success: boolean; message: string; data?: NewsCategory[] }) ?? res.data.data ?? []
  },

  async getCategoryById(id: string): Promise<NewsCategory> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsCategory }>(`/cms/news-categories/${id}`)
    const data = unwrapData<NewsCategory>(res.data as unknown as { success: boolean; message: string; data?: NewsCategory }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Category not found')
    return data
  },

  async getTags(): Promise<NewsTag[]> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsTag[] }>('/cms/news-tags')
    return unwrapData<NewsTag[]>(res.data as unknown as { success: boolean; message: string; data?: NewsTag[] }) ?? res.data.data ?? []
  },

  async getTagById(id: string): Promise<NewsTag> {
    const res = await api.get<{ success: boolean; message: string; data?: NewsTag }>(`/cms/news-tags/${id}`)
    const data = unwrapData<NewsTag>(res.data as unknown as { success: boolean; message: string; data?: NewsTag }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Tag not found')
    return data
  },
}
