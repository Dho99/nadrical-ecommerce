export interface StandardResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  meta?: PaginationMeta
  errors?: unknown
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}