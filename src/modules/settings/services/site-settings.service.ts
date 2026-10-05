import api, { unwrapData } from '../../../shared/lib/api'

export interface SiteSetting {
  key: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'url'
  description?: string
  uuid?: string
}

interface BackendPageSetting {
  uuid: string
  key: string
  value: unknown
  type?: string
  description?: string
}

function mapSetting(b: BackendPageSetting): SiteSetting {
  return {
    key: b.key,
    value: typeof b.value === 'string' ? b.value : JSON.stringify(b.value ?? ''),
    type: (b.type as SiteSetting['type']) || 'text',
    description: b.description,
    uuid: b.uuid,
  }
}

export const siteSettingsService = {
  async getSettings(keys?: string[]): Promise<Record<string, SiteSetting>> {
    if (keys && keys.length > 0) {
      const out: Record<string, SiteSetting> = {}
      for (const k of keys) {
        const s = await this.getSetting(k)
        if (s) out[k] = s
      }
      return out
    }
    const res = await api.get<{ success: boolean; message: string; data?: BackendPageSetting[] }>('/cms/page-settings')
    const data = unwrapData<BackendPageSetting[]>(res.data as unknown as { success: boolean; message: string; data?: BackendPageSetting[] }) ?? res.data.data ?? []
    const out: Record<string, SiteSetting> = {}
    for (const b of data) out[b.key] = mapSetting(b)
    return out
  },

  async updateSetting(key: string, value: string): Promise<SiteSetting> {
    const existing = await this.getSetting(key).catch(() => null)
    if (existing?.uuid) {
      const res = await api.put<{ success: boolean; message: string; data?: BackendPageSetting }>(`/cms/page-settings/${existing.uuid}`, { value })
      const data = unwrapData<BackendPageSetting>(res.data as unknown as { success: boolean; message: string; data?: BackendPageSetting }) ?? res.data.data
      if (!data) throw new Error(res.data.message || 'Failed to update setting')
      return mapSetting(data)
    }
    const res = await api.post<{ success: boolean; message: string; data?: BackendPageSetting }>('/cms/page-settings', { key, value, type: 'text' })
    const data = unwrapData<BackendPageSetting>(res.data as unknown as { success: boolean; message: string; data?: BackendPageSetting }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to create setting')
    return mapSetting(data)
  },

  async getSetting(key: string): Promise<SiteSetting | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: BackendPageSetting }>(`/cms/page-settings`, { params: { key } })
      const data = unwrapData<BackendPageSetting>(res.data as unknown as { success: boolean; message: string; data?: BackendPageSetting }) ?? res.data.data
      if (!data) return null
      if (Array.isArray(data)) {
        const first = (data as unknown as BackendPageSetting[])[0]
        return first ? mapSetting(first) : null
      }
      return mapSetting(data as BackendPageSetting)
    } catch {
      return null
    }
  },
}
