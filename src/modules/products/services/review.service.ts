import api, { unwrapData } from '../../../shared/lib/api'
import type { Review, ReviewQuery, ReviewRating, ReviewStats } from '../types/review.type'
import { reviewStats, sortReviews } from './review.mock'
import { userReviewStorage } from './userReview.storage'

export interface ReviewPage {
  items: Review[]
  stats: ReviewStats
  total: number
}

export interface BackendReviewItem {
  uuid?: string
  id?: string
  product_uuid?: string
  product_id?: string
  order_item_uuid?: string
  rating: number
  comment: string
  image_urls?: string[]
  is_verified_purchase?: boolean
  author?: {
    uuid?: string
    name?: string
    username?: string
    avatar_url?: string
  } | string
  account?: {
    uuid?: string
    full_name?: string
    username?: string
    avatar_url?: string
  }
  created_at: string
}

export function mapBackendReview(item: BackendReviewItem): Review {
  let authorName = 'Pelanggan'
  if (typeof item.author === 'string') {
    authorName = item.author
  } else if (item.author?.name) {
    authorName = item.author.name
  } else if (item.author?.username) {
    authorName = item.author.username
  } else if (item.account?.full_name) {
    authorName = item.account.full_name
  } else if (item.account?.username) {
    authorName = item.account.username
  }

  const rawRating = Math.round(Number(item.rating) || 5)
  const clampedRating = Math.min(5, Math.max(1, rawRating)) as ReviewRating

  return {
    id: item.uuid || item.id || `rev-${Date.now()}`,
    product_id: item.product_uuid || item.product_id || '',
    rating: clampedRating,
    author: authorName,
    author_id: (typeof item.author !== 'string' ? item.author?.uuid : undefined) || item.account?.uuid,
    comment: item.comment || '',
    created_at: item.created_at || new Date().toISOString(),
    verified: Boolean(item.is_verified_purchase || item.order_item_uuid),
  }
}

function parseBackendStats(statsRaw: Record<string, unknown> | undefined): ReviewStats | null {
  if (!statsRaw) return null
  const dist = (statsRaw.distribution as Record<string, number>) || {}
  return {
    avg: Number(statsRaw.average_rating || 0),
    count: Number(statsRaw.total_reviews || 0),
    distribution: {
      1: Number(dist['1'] || dist[1] || 0),
      2: Number(dist['2'] || dist[2] || 0),
      3: Number(dist['3'] || dist[3] || 0),
      4: Number(dist['4'] || dist[4] || 0),
      5: Number(dist['5'] || dist[5] || 0),
    },
  }
}

function normalizeStats(stats: ReviewStats, hintAvg: number): ReviewStats {
  if (stats.count === 0) {
    return { avg: hintAvg, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }
  return stats
}

export const reviewService = {
  async getRatingSummary(productId: string): Promise<ReviewStats | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
    if (!isUuid) return null
    try {
      const res = await api.get<{ success: boolean; data?: Record<string, unknown> }>(
        `/ecommerce/products/${productId}/ratings`,
      )
      return parseBackendStats(res.data?.data)
    } catch {
      return null
    }
  },

  async getReviews(
    productId: string,
    query: ReviewQuery = {},
    hints?: { rating?: number; reviewCount?: number },
  ): Promise<ReviewPage> {
    const sort = query.sort ?? 'rating-desc'
    const rating = query.rating ?? 'all'
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.max(1, query.limit ?? 10)

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
    let backendReviews: Review[] = []
    let backendStats: ReviewStats | null = null
    let backendTotal = 0

    if (isUuid) {
      try {
        const params: Record<string, string | number> = { page, limit, sort }
        if (rating !== 'all') params.rating = rating
        const res = await api.get<{
          success: boolean
          message: string
          data?: BackendReviewItem[] | { items?: BackendReviewItem[]; data?: BackendReviewItem[] }
          meta?: {
            total?: number
            stats?: Record<string, unknown>
          }
        }>(`/ecommerce/products/${productId}/reviews`, {
          params,
        })

        const rawData = res.data?.data
        let rawItems: BackendReviewItem[] = []
        if (Array.isArray(rawData)) {
          rawItems = rawData
        } else if (rawData && typeof rawData === 'object') {
          const obj = rawData as { items?: BackendReviewItem[]; data?: BackendReviewItem[] }
          if (Array.isArray(obj.items)) rawItems = obj.items
          else if (Array.isArray(obj.data)) rawItems = obj.data
        }

        backendReviews = rawItems.map(mapBackendReview)
        backendTotal = res.data?.meta?.total ?? backendReviews.length

        if (res.data?.meta?.stats) {
          backendStats = parseBackendStats(res.data.meta.stats)
        }
      } catch {
        // keep empty -> fallback below still shows user reviews
      }
    }

    const hintAvg = hints?.rating ?? 4.6

    const userRevs: Review[] = userReviewStorage.getReviewsForProduct(productId).map((ur) => ({
      id: ur.id,
      product_id: ur.productId,
      author: ur.reviewerName,
      rating: ur.rating,
      comment: ur.comment,
      created_at: ur.createdAt,
      verified: true,
    }))

    if (backendReviews.length > 0 || backendStats) {
      const existingIds = new Set(backendReviews.map((r) => r.id))
      const extraLocal = userRevs.filter((ur) => !existingIds.has(ur.id))
      const allItems = [...backendReviews, ...extraLocal]

      const finalStats: ReviewStats = backendStats ?? normalizeStats(reviewStats(allItems), hintAvg)
      return {
        items: allItems,
        stats: finalStats,
        total: backendTotal + extraLocal.length,
      }
    }

    const combined = [...userRevs]
    if (combined.length === 0) {
      return {
        items: [],
        stats: normalizeStats({ avg: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, hintAvg),
        total: 0,
      }
    }

    const stats = reviewStats(combined)
    const sorted = sortReviews(combined, sort)
    const filtered = rating === 'all' ? sorted : sorted.filter((r) => r.rating === rating)
    const finalStats = normalizeStats(stats, hintAvg)
    const start = (page - 1) * limit
    return { items: filtered.slice(start, start + limit), stats: finalStats, total: filtered.length }
  },

  async getAllReviews(page = 1, limit = 20): Promise<ReviewPage> {
    const res = await api.get<{
      success: boolean
      message: string
      data?: BackendReviewItem[]
      meta?: { total?: number; stats?: Record<string, unknown> }
    }>('/ecommerce/reviews', { params: { page, limit } })
    const rawItems = res.data.data ?? []
    const items = Array.isArray(rawItems) ? rawItems.map(mapBackendReview) : []
    return {
      items,
      stats: parseBackendStats(res.data.meta?.stats) ?? reviewStats(items),
      total: Number(res.data.meta?.total ?? items.length),
    }
  },

  async createReview(
    productId: string,
    input: {
      rating: ReviewRating
      comment: string
      order_item_uuid?: string
      image_urls?: string[]
    },
  ): Promise<Review> {
    const res = await api.post<{ success: boolean; message: string; data?: BackendReviewItem }>(
      `/ecommerce/products/${productId}/reviews`,
      {
        rating: input.rating,
        comment: input.comment,
        order_item_uuid: input.order_item_uuid,
        image_urls: input.image_urls,
      },
    )
    const data = unwrapData<BackendReviewItem>(res.data as unknown as { success: boolean; message: string; data?: BackendReviewItem }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Gagal membuat review')
    return mapBackendReview(data)
  },

  async updateReview(
    productId: string,
    reviewId: string,
    input: { rating?: ReviewRating; comment?: string; image_urls?: string[] },
  ): Promise<Review> {
    const res = await api.put<{ success: boolean; message: string; data?: BackendReviewItem }>(
      `/ecommerce/products/${productId}/reviews/${reviewId}`,
      input,
    )
    const data = unwrapData<BackendReviewItem>(res.data as unknown as { success: boolean; message: string; data?: BackendReviewItem }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Gagal memperbarui review')
    return mapBackendReview(data)
  },

  async deleteReview(productId: string, reviewId: string): Promise<void> {
    await api.delete(`/ecommerce/products/${productId}/reviews/${reviewId}`)
  },
}

export type { ReviewRating }
