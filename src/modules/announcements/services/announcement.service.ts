import api, { unwrapData } from '../../../shared/lib/api'

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
    const res = await api.get<{ success: boolean; message: string; data?: Announcement[] }>('/cms/announcements/active')
    return unwrapData<Announcement[]>(res.data as unknown as { success: boolean; message: string; data?: Announcement[] }) ?? res.data.data ?? []
  },

  async getAll(): Promise<Announcement[]> {
    const res = await api.get<{ success: boolean; message: string; data?: Announcement[] }>('/cms/announcements')
    return unwrapData<Announcement[]>(res.data as unknown as { success: boolean; message: string; data?: Announcement[] }) ?? res.data.data ?? []
  },

  async getById(id: string): Promise<Announcement | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: Announcement }>(`/cms/announcements/${id}`)
      return unwrapData<Announcement>(res.data as unknown as { success: boolean; message: string; data?: Announcement }) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  async create(data: Omit<Announcement, 'uuid' | 'created_at' | 'updated_at'>): Promise<Announcement> {
    const res = await api.post<{ success: boolean; message: string; data?: Announcement }>('/cms/announcements', data)
    const created = unwrapData<Announcement>(res.data as unknown as { success: boolean; message: string; data?: Announcement }) ?? res.data.data
    if (!created) throw new Error(res.data.message || 'Failed to create announcement')
    return created
  },

  async update(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const res = await api.put<{ success: boolean; message: string; data?: Announcement }>(`/cms/announcements/${id}`, data)
    const updated = unwrapData<Announcement>(res.data as unknown as { success: boolean; message: string; data?: Announcement }) ?? res.data.data
    if (!updated) throw new Error(res.data.message || 'Failed to update announcement')
    return updated
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/cms/announcements/${id}`)
  },
}
