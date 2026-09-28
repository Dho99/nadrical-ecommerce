import api from '../../../shared/lib/api'

export interface BannerSetting {
  uuid?: string
  key: string
  value: string
}

export const bannerService = {
  async getHeroBanner(): Promise<string[]> {
    try {
      const res = await api.get<BannerSetting>('/cms/page-settings', { params: { key: 'hero_banner' } })
      const setting = (res.data as unknown as BannerSetting)
      if (setting && setting.value) {
        try {
          const parsed = JSON.parse(setting.value)
          if (Array.isArray(parsed)) return parsed
        } catch {
          // If not JSON array, treat as single URL
          return [setting.value]
        }
      }
    } catch {
      // Fallback to default
    }
    return []
  },

  async getLogo(): Promise<string | null> {
    try {
      const res = await api.get<BannerSetting>('/cms/page-settings', { params: { key: 'logo_url' } })
      const setting = (res.data as unknown as BannerSetting)
      return setting?.value ?? null
    } catch {
      return null
    }
  },

  async getSiteTitle(): Promise<string | null> {
    try {
      const res = await api.get<BannerSetting>('/cms/page-settings', { params: { key: 'site_title' } })
      const setting = (res.data as unknown as BannerSetting)
      return setting?.value ?? null
    } catch {
      return null
    }
  },

  async getSiteTagline(): Promise<string | null> {
    try {
      const res = await api.get<BannerSetting>('/cms/page-settings', { params: { key: 'site_tagline' } })
      const setting = (res.data as unknown as BannerSetting)
      return setting?.value ?? null
    } catch {
      return null
    }
  },
}
