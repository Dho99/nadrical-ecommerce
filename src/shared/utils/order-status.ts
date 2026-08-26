import type { DbOrderStatus } from '../types/database.type'

export type OrderStatus = DbOrderStatus

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Pending payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending_payment: 'outline',
  paid: 'default',
  processing: 'default',
  shipped: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
  refunded: 'destructive',
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
  const idx = STATUS_STEPS.indexOf((status ?? 'pending_payment') as StatusStep)
  return idx
}

export function isTerminalBad(status?: OrderStatus): boolean {
  return status === 'cancelled' || status === 'refunded'
}

export function isCancellable(status?: OrderStatus): boolean {
  return status === 'pending_payment' || status === 'paid'
}
