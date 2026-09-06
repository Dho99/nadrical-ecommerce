import { useCallback, useEffect, useState } from 'react'
import { refundService } from '../services/refund.service'
import type { OrderWithItems } from '../types/order.type'
import type { RefundRecord } from '../types/refund.type'

export function useRefund(order: OrderWithItems | null) {
  const [record, setRecord] = useState<RefundRecord | null>(() =>
    order ? refundService.getByOrderId(order.id) : null,
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync refund when order loads
    setRecord(order ? refundService.getByOrderId(order.id) : null)
  }, [order?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setRecord(order ? refundService.getByOrderId(order.id) : null)
  }, [order])

  const applyRecord = useCallback((r: RefundRecord) => setRecord(r), [])

  return { record, applyRecord, refresh }
}
