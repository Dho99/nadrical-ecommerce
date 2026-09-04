import type { Review, ReviewRating, ReviewStats } from '../types/review.type'

const FIRST_NAMES = [
  'Aulia', 'Bima', 'Citra', 'Dimas', 'Eka', 'Farah', 'Gilang', 'Hana', 'Iqbal', 'Jasmine',
  'Kevin', 'Laras', 'Maya', 'Naufal', 'Olivia', 'Putri', 'Raka', 'Sari', 'Teguh', 'Vina',
  'Wulan', 'Yoga', 'Zahra', 'Andre', 'Bella',
]

const COMMENTS: Record<ReviewRating, string[]> = {
  5: [
    'Kualitas luar biasa, sesuai ekspektasi. Sangat puas dengan pembelian ini!',
    'Pengiriman cepat, barang datang dengan packing rapi. Recommended seller.',
    'Sudah pakai beberapa minggu, masih seperti baru. Worth every penny.',
    'Produk premium banget, detail finishing-nya rapi sekali.',
    'Langganan kedua kali, kualitasnya konsisten bagus.',
  ],
  4: [
    'Bagus secara keseluruhan, hanya sedikit kurang dari foto. Masih worth it.',
    'Kualitas oke, pengiriman agak lama tapi packing aman.',
    'Solid product. Ada satu hal kecil yang bisa diperbaiki tapi tak masalah.',
    'Harga sebanding dengan kualitas. Recommended.',
  ],
  3: [
    'Cukup biasa saja, sesuai harga tapi bukan wow.',
    'Fungsional tapi ada beberapa kekurangan kecil.',
    'Standar, tidak ada yang menonjol. Lumayan untuk harganya.',
  ],
  2: [
    'Kurang puas, kualitas tidak sesuai deskripsi.',
    'Sayangnya mengecewakan, ukuran tidak sesuai.',
  ],
  1: [
    'Sangat mengecewakan, produk rusak saat tiba.',
    'Tidak sesuai ekspektasi sama sekali. Request refund.',
  ],
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

function pickRating(rand: () => number, targetAvg: number): ReviewRating {
  const target = Math.min(5, Math.max(1, targetAvg))
  const offset = target - 4.2
  const weight = Math.round(20 + offset * 12)
  const r = rand() * 100
  if (r < weight * 0.25) return 5
  if (r < weight * 0.55) return 4
  if (r < weight * 0.55 + 8) return 3
  if (r < weight * 0.55 + 12) return 2
  return 1
}

export interface ReviewSeedHints {
  rating: number
  reviewCount: number
}

export function generateMockReviews(productId: string, hints: ReviewSeedHints): Review[] {
  const rand = mulberry32(hashSeed(productId))
  const count = Math.max(6, Math.min(hints.reviewCount || 24, 60))
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const reviews: Review[] = []

  for (let i = 0; i < count; i++) {
    const rating = pickRating(rand, hints.rating)
    const author = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const pool = COMMENTS[rating]
    const comment = pool[Math.floor(rand() * pool.length)]
    const createdMs = now - Math.floor(rand() * 90) * dayMs
    reviews.push({
      id: `${productId}-review-${i}`,
      product_id: productId,
      rating,
      author,
      comment,
      created_at: new Date(createdMs).toISOString(),
      verified: rand() > 0.25,
    })
  }

  return reviews
}

export function reviewStats(reviews: Review[]): ReviewStats {
  const distribution: Record<ReviewRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0
  for (const r of reviews) {
    distribution[r.rating] += 1
    sum += r.rating
  }
  const count = reviews.length
  return {
    avg: count > 0 ? sum / count : 0,
    count,
    distribution,
  }
}

export function sortReviews(reviews: Review[], sort: 'rating-desc' | 'rating-asc' | 'newest'): Review[] {
  const list = [...reviews]
  switch (sort) {
    case 'rating-asc':
      return list.sort(
        (a, b) => a.rating - b.rating || Date.parse(b.created_at) - Date.parse(a.created_at),
      )
    case 'newest':
      return list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    case 'rating-desc':
    default:
      return list.sort(
        (a, b) => b.rating - a.rating || Date.parse(b.created_at) - Date.parse(a.created_at),
      )
  }
}
