export interface UserReview {
  id: string
  productId: string
  orderNumber: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  reviewerName: string
  createdAt: string
  variantName?: string
}

const STORAGE_KEY = 'user-product-reviews-v1'

export const userReviewStorage = {
  getReviews(): UserReview[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as UserReview[]) : []
    } catch {
      return []
    }
  },

  addReview(data: Omit<UserReview, 'id' | 'createdAt'>): UserReview {
    const list = this.getReviews()
    const newReview: UserReview = {
      ...data,
      id: `usr-rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    const updated = [newReview, ...list]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    return newReview
  },

  findReview(orderNumber: string, productId: string, variantName?: string): UserReview | undefined {
    const list = this.getReviews()
    return list.find(
      (r) =>
        r.orderNumber === orderNumber &&
        r.productId === productId &&
        (variantName ? r.variantName === variantName : true),
    )
  },

  getReviewsForProduct(productId: string): UserReview[] {
    return this.getReviews().filter((r) => r.productId === productId)
  },
}
