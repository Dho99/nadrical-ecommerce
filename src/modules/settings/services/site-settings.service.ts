import api from '../../../shared/lib/api'

export interface SiteSetting {
  key: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'url'
  description?: string
}

export const siteSettingsService = {
  async getSettings(keys?: string[]): Promise<Record<string, SiteSetting>> {
    const params = keys ? `?keys=${keys.join(',')}` : ''
    const res = await api.get<Record<string, SiteSetting>>(`/cms/page-settings${params}`)
    return res.data as unknown as Record<string, SiteSetting>
  },

  async updateSetting(key: string, value: string): Promise<SiteSetting> {
    const res = await api.put<SiteSetting>(`/cms/page-settings/${key}`, { value })
    return res.data as unknown as SiteSetting
  },

  async getSetting(key: string): Promise<SiteSetting | null> {
    try {
      const res = await api.get<SiteSetting>(`/cms/page-settings/${key}`)
      return res.data as unknown as SiteSetting
    } catch {
      return null
    }
  },
}
