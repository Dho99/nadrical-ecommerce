import { useEffect, useState } from 'react'
import { announcementService, type Announcement } from '../services/announcement.service'

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [])

  return { announcements, loading, error }
}
