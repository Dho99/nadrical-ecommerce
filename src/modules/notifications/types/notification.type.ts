import type { DbNotification, DbNotificationType } from '../../../shared/types/database.type'
import type { OrderStatus } from '../../../shared/utils/order-status'

export type NotificationDb = DbNotification
export type NotificationType = DbNotificationType

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  content: string
  created_at: string
  is_read: boolean
  order_id?: string
  user_id?: string
}

export interface NotificationStore {
  items: AppNotification[]
  lastStatus: Record<string, OrderStatus>
}
