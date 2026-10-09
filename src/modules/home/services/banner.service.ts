import api, { unwrapData } from '../../../shared/lib/api'

export interface BannerSetting {
  uuid?: string
  key: string
  value: string
}

interface BackendPageSetting {
  uuid: string
  key: string
  value: unknown
  type?: string
}

function extractSettingValue(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const data = (unwrapData<BackendPageSetting | BackendPageSetting[]>(obj) ?? (obj.data as unknown)) as BackendPageSetting | BackendPageSetting[] | undefined
  const first = Array.isArray(data) ? data[0] : (data as BackendPageSetting | undefined)
  if (!first) {
    const direct = obj as unknown as BackendPageSetting
    if (direct.key && direct.value !== undefined) {
      return typeof direct.value === 'string' ? direct.value : JSON.stringify(direct.value ?? '')
    }
    return null
  }
  const v = first.value
  return typeof v === 'string' ? v : v != null ? JSON.stringify(v) : null
}

export const bannerService = {
  async getHeroBanner(): Promise<string[]> {
    try {
      const res = await api.get('/cms/page-settings', { params: { key: 'hero_banner' } })
      const value = extractSettingValue(res.data)
      if (value) {
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === 'string') return parsed.filter((x): x is string => typeof x === 'string' && x.length > 0)
            if (typeof parsed[0] === 'object' && parsed[0] !== null) {
              const imgs = (parsed as Record<string, unknown>[])
                .map((o) => (typeof o.image === 'string' ? o.image : typeof o.url === 'string' ? o.url : typeof o.src === 'string' ? o.src : ''))
                .filter((s) => s.length > 0)
              if (imgs.length > 0) return imgs
            }
          }
          if (typeof parsed === 'string' && parsed.length > 0) return [parsed]
        } catch {
          return [value]
        }
      }
    } catch {
      // Fallback to default
    }
    return []
  },

  async getLogo(): Promise<string | null> {
    try {
      const res = await api.get('/cms/page-settings', { params: { key: 'logo_url' } })
      return extractSettingValue(res.data)
    } catch {
      return null
    }
  },

  async getSiteTitle(): Promise<string | null> {
    try {
      const res = await api.get('/cms/page-settings', { params: { key: 'site_title' } })
      return extractSettingValue(res.data)
    } catch {
      return null
    }
  },

  async getSiteTagline(): Promise<string | null> {
    try {
      const res = await api.get('/cms/page-settings', { params: { key: 'site_tagline' } })
      return extractSettingValue(res.data)
    } catch {
      return null
    }
  },
}
