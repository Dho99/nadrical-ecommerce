import type { DbOrderStatus } from '../types/database.type'

export type OrderStatus = DbOrderStatus

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Pending payment',
  WAITING_ONGKIR: 'Waiting for shipping fee',
  WAITING_CONFIRMATION: 'Waiting for confirmation',
  DELIVERING: 'Delivering',
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
  WAITING_ONGKIR: 'outline',
  WAITING_CONFIRMATION: 'secondary',
  DELIVERING: 'secondary',
  paid: 'default',
  processing: 'default',
  shipped: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
  refunded: 'destructive',
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-500 text-white border-amber-500',
  WAITING_ONGKIR: 'bg-amber-500 text-white border-amber-500',
  WAITING_CONFIRMATION: 'bg-blue-500 text-white border-blue-500',
  DELIVERING: 'bg-blue-500 text-white border-blue-500',
  paid: 'bg-emerald-600 text-white border-emerald-600',
  processing: 'bg-blue-600 text-white border-blue-600',
  shipped: 'bg-sky-600 text-white border-sky-600',
  completed: 'bg-emerald-600 text-white border-emerald-600',
  cancelled: 'bg-destructive text-destructive-foreground border-destructive',
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
  const idx = STATUS_STEPS.indexOf((status ?? 'pending_payment') as StatusStep)
  return idx
}

export function isTerminalBad(status?: OrderStatus): boolean {
  return status === 'cancelled' || status === 'refunded'
}

export function isCancellable(status?: OrderStatus): boolean {
  return status === 'pending_payment' || status === 'paid' || status === 'WAITING_ONGKIR'
}
