export type ReviewRating = 1 | 2 | 3 | 4 | 5

export interface Review {
  id: string
  product_id: string
  rating: ReviewRating
  author: string
  comment: string
  created_at: string
  verified: boolean
}

export interface ReviewStats {
  avg: number
  count: number
  distribution: Record<ReviewRating, number>
}

export interface ReviewQuery {
  sort?: 'rating-desc' | 'rating-asc' | 'newest'
  rating?: ReviewRating | 'all'
  page?: number
  limit?: number
}
