import type { AppNotification } from '../types/notification.type'

export const NOTIFICATION_STORAGE_KEY = 'store-notifications-v1'

export const SEED_ANNOUNCEMENTS: Array<Pick<AppNotification, 'type' | 'title' | 'content'>> = [
  {
    type: 'announcement',
    title: 'Welcome to Store.',
    content: 'Sign in to track your orders, get status updates, and receive announcements.',
  },
  {
    type: 'announcement',
    title: 'Free standard shipping over $200',
    content: 'Spend $200 or more and standard shipping is on us — no code needed.',
  },
]
