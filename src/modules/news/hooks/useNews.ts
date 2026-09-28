import { useEffect, useState } from 'react'
import { newsService, type News, type NewsListResponse, type NewsCategory } from '../services/news.service'

export function useNewsList(params?: {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
}) {
  const [data, setData] = useState<NewsListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const result = await newsService.list(params)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params is a shallow object that changes on every parent render
  }, [params?.page, params?.limit, params?.search, params?.category, params?.status])

  return { data, loading, error }
}

export function useNewsDetail(slug: string) {
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetch = async () => {
      try {
        setLoading(true)
        const result = await newsService.getBySlug(slug)
        setNews(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news')
        setNews(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [slug])

  return { news, loading, error }
}

export function useNewsCategories() {
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const result = await newsService.getCategories()
        setCategories(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { categories, loading, error }
}
