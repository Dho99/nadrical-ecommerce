import api, { unwrapData } from '../../../shared/lib/api'
import type { Review, ReviewQuery, ReviewRating, ReviewStats } from '../types/review.type'
import { reviewStats, sortReviews } from './review.mock'
import { userReviewStorage } from './userReview.storage'

export interface ReviewPage {
  items: Review[]
  stats: ReviewStats
  total: number
}

function normalizeStats(stats: ReviewStats, hintAvg: number): ReviewStats {
  if (stats.count === 0) {
    return { avg: hintAvg, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }
  return stats
}

export const reviewService = {
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

    if (isUuid) {
      try {
        const res = await api.get<{ success: boolean; message: string; data?: Review[] | { items?: Review[]; data?: Review[] } }>(`/ecommerce/products/${productId}/reviews`, {
          params: { page, limit, sort },
        })
        const data = unwrapData<Review[] | { items?: Review[]; data?: Review[] }>(res.data as unknown as { success: boolean; message: string; data?: Review[] }) ?? res.data.data
        if (Array.isArray(data)) backendReviews = data as Review[]
        else if (data && typeof data === 'object') {
          const obj = data as { items?: Review[]; data?: Review[] }
          if (Array.isArray(obj.items)) backendReviews = obj.items
          else if (Array.isArray(obj.data)) backendReviews = obj.data
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

    const combined = [...userRevs, ...backendReviews]
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

  async createReview(productId: string, input: { rating: ReviewRating; comment: string }): Promise<Review> {
    const res = await api.post<{ success: boolean; message: string; data?: Review }>(`/ecommerce/products/${productId}/reviews`, {
      rating: input.rating,
      comment: input.comment,
    })
    const data = unwrapData<Review>(res.data as unknown as { success: boolean; message: string; data?: Review }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Gagal membuat review')
    return data
  },

  async deleteReview(productId: string, reviewId: string): Promise<void> {
    await api.delete(`/ecommerce/products/${productId}/reviews/${reviewId}`)
  },
}

export type { ReviewRating }
