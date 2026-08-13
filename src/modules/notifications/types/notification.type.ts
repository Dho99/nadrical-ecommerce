import type { OrderStatus } from '../../../shared/utils/order-status'

export type NotificationType = 'order' | 'announcement'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
  orderNumber?: string
  email?: string
}

export interface NotificationStore {
  items: AppNotification[]
  lastStatus: Record<string, OrderStatus>
}
