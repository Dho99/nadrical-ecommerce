import type { RefundRecord, RefundRequest, RefundStatus } from '../types/refund.type'
import { REFUND_STATUS_LABEL } from '../types/refund.type'

// In-memory store. Refund will be wired to the API next — no localStorage.
const records: RefundRecord[] = []

export const refundService = {
  list(): RefundRecord[] {
    return [...records]
  },

  getByOrderId(orderId: string): RefundRecord | null {
    return records.find((r) => r.orderId === orderId) ?? null
  },

  request(req: RefundRequest): RefundRecord {
    const now = new Date().toISOString()
    const record: RefundRecord = {
      orderId: req.orderId,
      orderNumber: req.orderNumber,
      reason: req.reason,
      note: req.note,
      proofs: req.proofs,
      status: 'PENDING' as RefundStatus,
      timeline: [
        { status: 'PENDING' as RefundStatus, label: REFUND_STATUS_LABEL.PENDING, at: now },
      ],
      requestedAt: now,
    }
    const idx = records.findIndex((r) => r.orderId === req.orderId)
    if (idx >= 0) records.splice(idx, 1)
    records.unshift(record)
    return record
  },

  clear(): void {
    records.length = 0
  },
}
