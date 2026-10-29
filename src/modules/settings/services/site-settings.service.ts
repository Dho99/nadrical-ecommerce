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

async function fetchAllSettings(): Promise<Record<string, SiteSetting>> {
  const res = await api.get<{ success: boolean; message: string; data?: BackendPageSetting[] }>('/cms/page-settings')
  const data = unwrapData<BackendPageSetting[]>(res.data as unknown as { success: boolean; message: string; data?: BackendPageSetting[] }) ?? res.data.data ?? []
  const out: Record<string, SiteSetting> = {}
  for (const item of data) out[item.key] = mapSetting(item)
  return out
}

export const siteSettingsService = {
  async getSettings(keys?: string[]): Promise<Record<string, SiteSetting>> {
    const all = await fetchAllSettings()
    if (!keys || keys.length === 0) return all
    const out: Record<string, SiteSetting> = {}
    for (const key of keys) {
      if (all[key]) out[key] = all[key]
    }
    return out
  },

  async updateSetting(key: string, value: string): Promise<SiteSetting> {
    const all = await fetchAllSettings()
    const existing = all[key]
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

  async getById(id: string): Promise<SiteSetting | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: BackendPageSetting }>(`/cms/page-settings/${id}`)
      const data = unwrapData<BackendPageSetting>(res.data as unknown as { success: boolean; message: string; data?: BackendPageSetting }) ?? res.data.data
      return data ? mapSetting(data) : null
    } catch {
      return null
    }
  },

  async getSetting(key: string): Promise<SiteSetting | null> {
    try {
      const all = await fetchAllSettings()
      return all[key] ?? null
    } catch {
      return null
    }
  },
}
