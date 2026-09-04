import { cn } from '../utils/cn'
import { Badge } from './ui'
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from '../utils/order-status'
import type { DbOrderStatus } from '../types/database.type'

interface OrderStatusBadgeProps {
  status?: DbOrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const s: DbOrderStatus = status ?? 'pending_payment'
  return (
    <Badge variant={ORDER_STATUS_VARIANT[s]} className={cn('font-mono text-[10px] uppercase tracking-wider', ORDER_STATUS_COLOR[s], className)}>
      {ORDER_STATUS_LABEL[s]}
    </Badge>
  )
}
