export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface CursorPage<T> {
  items: T[]
  total: number
  nextCursor: number | null
  prevCursor: number | null
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'
