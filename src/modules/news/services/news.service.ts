import api from '../../../shared/lib/api'

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
    const res = await api.get<NewsListResponse>('/cms/news', { params })
    return res.data as unknown as NewsListResponse
  },

  async getById(id: string): Promise<News> {
    const res = await api.get<News>(`/cms/news/${id}`)
    return res.data as unknown as News
  },

  async getBySlug(slug: string): Promise<News> {
    const res = await api.get<News>(`/cms/news/slug/${slug}`)
    return res.data as unknown as News
  },

  async getCategories(): Promise<NewsCategory[]> {
    const res = await api.get<NewsCategory[]>('/cms/news-categories')
    return res.data as unknown as NewsCategory[]
  },

  async getCategoryById(id: string): Promise<NewsCategory> {
    const res = await api.get<NewsCategory>(`/cms/news-categories/${id}`)
    return res.data as unknown as NewsCategory
  },

  async getTags(): Promise<NewsTag[]> {
    const res = await api.get<NewsTag[]>('/cms/news-tags')
    return res.data as unknown as NewsTag[]
  },

  async getTagById(id: string): Promise<NewsTag> {
    const res = await api.get<NewsTag>(`/cms/news-tags/${id}`)
    return res.data as unknown as NewsTag
  },
}
