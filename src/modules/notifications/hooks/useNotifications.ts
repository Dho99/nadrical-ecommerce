import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import type { AppNotification } from '../types/notification.type'
import { notificationService } from '../services/notification.service'

export function useNotifications() {
  const { user } = useAuth()
  const email = user?.email
  const [items, setItems] = useState<AppNotification[]>([])
  const [loaded, setLoaded] = useState(false)

  const sync = useCallback(() => {
    if (!email) return
    setItems(notificationService.syncNotifications(email))
    setLoaded(true)
  }, [email])

  useEffect(() => {
    if (!email) return
    const initial = setTimeout(sync, 0)
    const interval = setInterval(sync, 60_000)
    const onFocus = () => sync()
    window.addEventListener('focus', onFocus)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [sync, email])

  const markRead = useCallback((id: string) => {
    notificationService.markRead(id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)))
  }, [])

  const markAllRead = useCallback(() => {
    notificationService.markAllRead()
    setItems((prev) => prev.map((i) => ({ ...i, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    notificationService.clearAll()
    setItems([])
  }, [])

  const visible = email ? items : []
  const isLoaded = email ? loaded : false

  return {
    items: visible,
    unreadCount: visible.filter((i) => !i.read).length,
    loaded: isLoaded,
    sync,
    markRead,
    markAllRead,
    clearAll,
  }
}