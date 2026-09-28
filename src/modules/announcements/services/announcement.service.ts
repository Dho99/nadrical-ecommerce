import api from '../../../shared/lib/api'

export interface Announcement {
  uuid: string
  title: string
  content: string
  target_scope?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: { uuid: string; username: string }
}

export const announcementService = {
  async getActive(): Promise<Announcement[]> {
    try {
      const res = await api.get<Announcement[]>('/cms/announcements/active')
      return (res.data as unknown as Announcement[]) ?? []
    } catch {
      return []
    }
  },

  async getAll(): Promise<Announcement[]> {
    try {
      const res = await api.get<Announcement[]>('/cms/announcements')
      return (res.data as unknown as Announcement[]) ?? []
    } catch {
      return []
    }
  },

  async getById(id: string): Promise<Announcement | null> {
    try {
      const res = await api.get<Announcement>(`/cms/announcements/${id}`)
      return (res.data as unknown as Announcement) ?? null
    } catch {
      return null
    }
  },

  async create(data: Omit<Announcement, 'uuid' | 'created_at' | 'updated_at'>): Promise<Announcement> {
    const res = await api.post<Announcement>('/cms/announcements', data)
    return (res.data as unknown as Announcement)
  },

  async update(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const res = await api.put<Announcement>(`/cms/announcements/${id}`, data)
    return (res.data as unknown as Announcement)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/cms/announcements/${id}`)
  },
}
