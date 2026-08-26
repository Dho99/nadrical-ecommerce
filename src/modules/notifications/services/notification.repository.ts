import type { NotificationStore } from '../types/notification.type'
import type { DbNotification } from '../../../shared/types/database.type'

const NOTIFICATIONS_KEY = 'db-notifications'
const STATUS_KEY = 'db-notification-statuses'

export const notificationRepository = {
  load(): NotificationStore {
    try {
      const rawN = localStorage.getItem(NOTIFICATIONS_KEY)
      const lastStatus = JSON.parse(localStorage.getItem(STATUS_KEY) || '{}') as NotificationStore['lastStatus']

      if (rawN !== null) {
        const dbNotifications = JSON.parse(rawN) as DbNotification[]
        const items = dbNotifications.map((n) => ({
          id: n.id,
          type: n.type ?? ('announcement' as const),
          title: n.title,
          content: n.content,
          created_at: n.created_at || '',
          is_read: n.is_read || false,
          order_id: n.order_id || undefined,
          user_id: n.user_id || undefined,
        }))
        return { items, lastStatus }
      }
    } catch {
      // fall through
    }
    return { items: [], lastStatus: {} }
  },

  save(store: NotificationStore): void {
    const dbNotifications: DbNotification[] = store.items.map((n) => ({
      id: n.id,
      user_id: n.user_id || undefined,
      type: n.type,
      title: n.title,
      content: n.content,
      is_read: n.is_read,
      order_id: n.order_id || undefined,
      created_at: n.created_at,
    }))

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(dbNotifications))
    localStorage.setItem(STATUS_KEY, JSON.stringify(store.lastStatus))
  },
}
