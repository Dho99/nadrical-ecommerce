import { useEffect, useState } from 'react'
import { announcementService, type Announcement } from '../services/announcement.service'
import { websocketService } from '../../../shared/lib/websocket'

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRefetch = () => setAttempt((a) => a + 1)
    const unsub1 = websocketService.on('announcement_updated', triggerRefetch)
    const unsub2 = websocketService.on('announcement', triggerRefetch)
    const unsub3 = websocketService.on('announcements_updated', triggerRefetch)
    const unsub4 = websocketService.on('data_updated', (payload: { resource?: string } | null) => {
      if (!payload || payload.resource === 'announcements' || payload.resource === 'pengumuman') {
        triggerRefetch()
      }
    })
    const onFocus = () => triggerRefetch()
    window.addEventListener('focus', onFocus)

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const data = await announcementService.getActive()
        setAnnouncements(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcements')
        setAnnouncements([])
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [attempt])

  return { announcements, loading, error }
}
