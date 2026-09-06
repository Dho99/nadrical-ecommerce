export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

export interface RefundProof {
  id: string
  kind: 'image' | 'video'
  name: string
  size: number
  preview: string
}

export interface RefundRequest {
  orderId: string
  orderNumber: string
  reason: string
  note?: string
  proofs?: RefundProof[]
}

export interface RefundEvent {
  status: RefundStatus
  label: string
  at: string
}

export interface RefundRecord {
  orderId: string
  orderNumber: string
  reason: string
  note?: string
  proofs?: RefundProof[]
  status: RefundStatus
  timeline: RefundEvent[]
  requestedAt: string
}

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  PENDING: 'Refund requested',
  APPROVED: 'Under review',
  REJECTED: 'Rejected',
  COMPLETED: 'Refund completed',
}
