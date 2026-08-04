import { useEffect, useState } from 'react'
import type { AsyncStatus, CursorPage } from '../../../shared/types/common.type'
import type { OrderRecord } from '../../../shared/types/order.type'
import { orderService } from '../services/order.service'

interface OrdersState {
  orders: OrderRecord[]
  total: number
  nextCursor: number | null
  error: string | null
  loaded: boolean
}

export function useOrders(limit = 10) {
  const [state, setState] = useState<OrdersState>({
    orders: [],
    total: 0,
    nextCursor: null,
    error: null,
    loaded: false,
  })
  const [cursor, setCursor] = useState<number | null>(0)
  const [attempt, setAttempt] = useState(0)

  const status: AsyncStatus = state.error ? 'error' : state.loaded ? 'success' : 'loading'

  useEffect(() => {
    let cancelled = false

    orderService
      .ensureSeeded()
      .then(() => orderService.listOrdersPage(cursor, limit))
      .then((page: CursorPage<OrderRecord>) => {
        if (!cancelled) {
          setState({
            orders: page.items,
            total: page.total,
            nextCursor: page.nextCursor,
            error: null,
            loaded: true,
          })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            orders: [],
            total: 0,
            nextCursor: null,
            error: err instanceof Error ? err.message : 'Failed to load orders',
            loaded: true,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [cursor, limit, attempt])

  const pageStart = (cursor ?? 0) + 1

  return {
    orders: state.orders,
    total: state.total,
    cursor,
    pageStart,
    status,
    error: state.error,
    goNext: () => state.nextCursor !== null && setCursor(state.nextCursor),
    goPrev: () => cursor !== null && cursor > 0 && setCursor(Math.max(0, cursor - limit)),
    refetch: () => setAttempt((a) => a + 1),
  } satisfies {
    orders: OrderRecord[]
    total: number
    cursor: number | null
    pageStart: number
    status: AsyncStatus
    error: string | null
    goNext: () => void
    goPrev: () => void
    refetch: () => void
  }
}
