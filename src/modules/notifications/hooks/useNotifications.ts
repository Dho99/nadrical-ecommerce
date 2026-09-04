import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/shared/lib/alert'
import { useAuth } from '../../auth'
import type { AppNotification } from '../types/notification.type'
import { notificationService } from '../services/notification.service'
import { websocketService } from '../../../shared/lib/websocket'

interface NotificationPayload {
  type: string
  payload?: AppNotification
}

export function useNotifications() {
  const { user } = useAuth()
  const email = user?.email
  const [items, setItems] = useState<AppNotification[]>([])
  const [loaded, setLoaded] = useState(false)

  const sync = useCallback(async () => {
    if (!email) return
    const stored = notificationService.getStoredNotifications()
    setItems(stored)
    setLoaded(true)

    try {
      const synced = await notificationService.syncNotifications(email)
      setItems(synced)
    } catch {
      // ignore
    }
  }, [email])

  useEffect(() => {
    if (!email) return
    void sync()
    const interval = setInterval(() => void sync(), 60_000)
    const onFocus = () => void sync()
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onFocus)

    // Listen for real-time announcements
    const unsubAnn = websocketService.on('announcement', (event: unknown) => {
      const e = event as NotificationPayload
      if (e?.payload) {
        notificationService.receiveIncoming(e.payload)
        void sync()
        toast.info(e.payload.title, {
          description: e.payload.content,
        })
      }
    })

    // Listen for real-time order/system notifications
    const unsubNotif = websocketService.on('notification', (event: unknown) => {
      const e = event as NotificationPayload
      if (e?.payload) {
        // If notification is targeted to current user or broadcast
        if (!e.payload.user_id || e.payload.user_id.toLowerCase() === email.toLowerCase()) {
          notificationService.receiveIncoming(e.payload)
          void sync()
          toast(e.payload.title, {
            description: e.payload.content,
          })
        }
      }
    })

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onFocus)
      unsubAnn()
      unsubNotif()
    }
  }, [sync, email])

  const markRead = useCallback((id: string) => {
    notificationService.markRead(id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)))
  }, [])

  const markAllRead = useCallback(() => {
    notificationService.markAllRead()
    setItems((prev) => prev.map((i) => ({ ...i, is_read: true })))
  }, [])

  const clearAll = useCallback(() => {
    notificationService.clearAll()
    setItems([])
  }, [])

  const visible = email ? items : []
  const isLoaded = email ? loaded : false

  return {
    items: visible,
    unreadCount: visible.filter((i) => !i.is_read).length,
    loaded: isLoaded,
    sync,
    markRead,
    markAllRead,
    clearAll,
  }
}