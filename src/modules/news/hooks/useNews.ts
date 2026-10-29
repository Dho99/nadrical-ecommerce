import { useEffect, useState } from 'react'
import { newsService, type NewsCategory, type NewsItem } from '../services/news.service'
import { websocketService } from '../../../shared/lib/websocket'

export function useNewsList(params: { search?: string; category?: string; page?: number; limit?: number } = {}) {
  const { search = '', category = '', page = 1, limit = 9 } = params
  const [items, setItems] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial/retry fetch lifecycle
    setLoading(true)
    setError(null)
    newsService
      .list({ search, category, page, limit })
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setTotal(result.total)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setItems([])
        setTotal(0)
        setError(err instanceof Error ? err.message : 'Gagal memuat berita')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [search, category, page, limit, attempt])

  useEffect(() => {
    const unsub = websocketService.on('data_updated', (payload: unknown) => {
      const resource = (payload as { resource?: string } | null)?.resource
      if (!resource || resource === 'news') setAttempt((value) => value + 1)
    })
    return unsub
  }, [])

  return { items, total, loading, error, refresh: () => setAttempt((value) => value + 1) }
}

export function useNewsCategories() {
  const [categories, setCategories] = useState<NewsCategory[]>([])
  useEffect(() => {
    let cancelled = false
    newsService
      .getCategories()
      .then((items) => {
        if (!cancelled) setCategories(items)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return categories
}

export function useNewsArticle(slug?: string) {
  const [item, setItem] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear when no slug
      setItem(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    newsService
      .getBySlug(slug)
      .then((result) => {
        if (!cancelled) setItem(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItem(null)
          setError(err instanceof Error ? err.message : 'Berita tidak ditemukan')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { item, loading, error }
}
