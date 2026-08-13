import type { NotificationStore } from '../types/notification.type'
import { NOTIFICATION_STORAGE_KEY } from '../constants/notification.constants'

export const notificationRepository = {
  load(): NotificationStore {
    try {
      const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as NotificationStore
        if (parsed && Array.isArray(parsed.items)) return parsed
      }
    } catch {
      // fall through to empty store
    }
    return { items: [], lastStatus: {} }
  },

  save(store: NotificationStore): void {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(store))
  },
}
