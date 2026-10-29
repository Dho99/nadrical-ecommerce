import type { DbOrderStatus } from '../types/database.type'

export type OrderStatus = DbOrderStatus

/**
 * Backend memakai enum uppercase (WAITING_ONGKIR, WAITING_CONFIRMATION,
 * DELIVERING, COMPLETED, CANCELED). UI memakai satu set status lowercase.
 * Normalisasi di boundary supaya tab, badge, dan aturan aksi konsisten.
 */
export function normalizeOrderStatus(status?: string | null): DbOrderStatus {
  const raw = (status ?? '').trim()
  const upper = raw.toUpperCase()

  switch (upper) {
    case 'WAITING_ONGKIR':
    case 'PENDING_PAYMENT':
      return 'pending_payment'
    case 'WAITING_CONFIRMATION':
    case 'PROCESSING':
      return 'processing'
    case 'DELIVERING':
    case 'SHIPPED':
      return 'shipped'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELED':
    case 'CANCELLED':
      return 'cancelled'
    case 'REFUNDED':
      return 'refunded'
    case 'PAID':
      return 'paid'
    default:
      return (raw.toLowerCase() || 'pending_payment') as DbOrderStatus
  }
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Pending payment',
  WAITING_ONGKIR: 'Waiting for shipping fee',
  waiting_ongkir: 'Waiting for shipping fee',
  WAITING_CONFIRMATION: 'Waiting for confirmation',
  waiting_confirmation: 'Waiting for confirmation',
  DELIVERING: 'Delivering',
  delivering: 'Delivering',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  COMPLETED: 'Completed',
  cancelled: 'Cancelled',
  CANCELED: 'Cancelled',
  canceled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending_payment: 'outline',
  WAITING_ONGKIR: 'outline',
  waiting_ongkir: 'outline',
  WAITING_CONFIRMATION: 'secondary',
  waiting_confirmation: 'secondary',
  DELIVERING: 'secondary',
  delivering: 'secondary',
  paid: 'default',
  processing: 'default',
  shipped: 'default',
  completed: 'secondary',
  COMPLETED: 'secondary',
  cancelled: 'destructive',
  CANCELED: 'destructive',
  canceled: 'destructive',
  refunded: 'destructive',
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending_payment: 'bg-amber-500 text-white border-amber-500',
  WAITING_ONGKIR: 'bg-amber-500 text-white border-amber-500',
  waiting_ongkir: 'bg-amber-500 text-white border-amber-500',
  WAITING_CONFIRMATION: 'bg-blue-500 text-white border-blue-500',
  waiting_confirmation: 'bg-blue-500 text-white border-blue-500',
  DELIVERING: 'bg-indigo-600 text-white border-indigo-600',
  delivering: 'bg-indigo-600 text-white border-indigo-600',
  paid: 'bg-emerald-600 text-white border-emerald-600',
  processing: 'bg-blue-600 text-white border-blue-600',
  shipped: 'bg-sky-600 text-white border-sky-600',
  completed: 'bg-emerald-600 text-white border-emerald-600',
  COMPLETED: 'bg-emerald-600 text-white border-emerald-600',
  cancelled: 'bg-destructive text-destructive-foreground border-destructive',
  CANCELED: 'bg-destructive text-destructive-foreground border-destructive',
  canceled: 'bg-destructive text-destructive-foreground border-destructive',
  refunded: 'bg-destructive text-destructive-foreground border-destructive',
}

export const STATUS_STEPS = [
  'payment_pending',
  'paid',
  'processing',
  'shipped',
  'completed',
] as const

export type StatusStep = (typeof STATUS_STEPS)[number]

export const STATUS_STEP_LABEL: Record<StatusStep, string> = {
  payment_pending: 'Payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Done',
}

export function statusStepIndex(status?: OrderStatus): number {
  const s = (status || '').toUpperCase()
  if (s === 'PENDING_PAYMENT' || s === 'WAITING_ONGKIR') return 0
  if (s === 'PAID') return 1
  if (s === 'PROCESSING' || s === 'WAITING_CONFIRMATION') return 2
  if (s === 'SHIPPED' || s === 'DELIVERING') return 3
  if (s === 'COMPLETED') return 4
  return -1
}

export function isTerminalBad(status?: OrderStatus): boolean {
  const s = (status || '').toUpperCase()
  return s === 'CANCELLED' || s === 'CANCELED' || s === 'REFUNDED'
}

export function isCancellable(status?: OrderStatus): boolean {
  const s = (status || '').toUpperCase()
  return (
    s === 'PENDING_PAYMENT' ||
    s === 'PAID' ||
    s === 'WAITING_ONGKIR' ||
    s === 'WAITING_CONFIRMATION'
  )
}
