import api from '../../../shared/lib/api'
import type { Review, ReviewQuery, ReviewRating, ReviewStats } from '../types/review.type'
import {
  generateMockReviews,
  reviewStats,
  sortReviews,
  type ReviewSeedHints,
} from './review.mock'

export interface ReviewPage {
  items: Review[]
  stats: ReviewStats
  total: number
}

function normalizeStats(stats: ReviewStats, hintAvg: number): ReviewStats {
  if (stats.count === 0) {
    return {
      avg: hintAvg,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }
  return stats
}

export const reviewService = {
  async getReviews(
    productId: string,
    query: ReviewQuery = {},
    hints?: ReviewSeedHints,
  ): Promise<ReviewPage> {
    const sort = query.sort ?? 'rating-desc'
    const rating = query.rating ?? 'all'
    const page = Math.max(1, query.page ?? 1)
    const limit = Math.max(1, query.limit ?? 10)

    let reviews: Review[] = []
    let stats: ReviewStats | null = null

    try {
      type ReviewEnvelope = {
        success: boolean
        data?: { items?: Review[]; data?: Review[] }
        meta?: { total?: number }
      }
      type ReviewListPayload = { items?: Review[]; data?: Review[] }
      const res = await api.get<ReviewEnvelope>(`/ecommerce/products/${productId}/reviews`, {
        params: { page, limit, sort },
      })
      const envelope: ReviewEnvelope = res.data
      const rawPayload: unknown = envelope.data ?? (envelope as unknown as ReviewListPayload & ReviewEnvelope)
      let items: Review[] = []
      if (Array.isArray(rawPayload)) {
        items = rawPayload as Review[]
      } else if (rawPayload !== null && typeof rawPayload === 'object') {
        const obj = rawPayload as ReviewListPayload
        if (Array.isArray(obj.items)) items = obj.items
        else if (Array.isArray(obj.data)) items = obj.data
      }
      if (items.length > 0) {
        reviews = items
        stats = reviewStats(reviews)
      }
    } catch {
      // fall through to mock
    }

    const hintAvg = hints?.rating ?? 4.6
    if (reviews.length === 0) {
      const mockAll = generateMockReviews(productId, {
        rating: hintAvg,
        reviewCount: hints?.reviewCount ?? 18,
      })
      reviews = mockAll
      stats = reviewStats(mockAll)
    }

    const sorted = sortReviews(reviews, sort)
    const filtered = rating === 'all' ? sorted : sorted.filter((r) => r.rating === rating)

    const finalStats = stats ? normalizeStats(stats, hintAvg) : normalizeStats(reviewStats(sorted), hintAvg)
    const start = (page - 1) * limit
    return {
      items: filtered.slice(start, start + limit),
      stats: finalStats,
      total: filtered.length,
    }
  },
}

export type { ReviewRating }
