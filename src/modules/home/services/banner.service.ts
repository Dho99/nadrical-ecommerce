import api, { unwrapData } from '../../../shared/lib/api'

export interface BannerSetting {
  uuid?: string
  key: string
  value: string
}

export interface RichBannerSlide {
  image: string
  badge?: string
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  mobileTemplate?: string
  mobileHeightPx?: number
}

export interface PopupBannerData {
  image: string
  link: string
  mobileTemplate?: string
  mobileMaxWidth?: number
  mobileAspectRatio?: string
  objectFit?: 'cover' | 'contain'
}

export interface LogoConfigData {
  navbarMobilePreset: string
  navbarMobileHeightPx: number
  navbarDesktopHeightPx: number
  footerMobilePreset: string
  footerMobileHeightPx: number
  footerDesktopHeightPx: number
  maxWidthPx?: number
}

interface BackendPageSetting {
  uuid?: string
  key?: string
  value?: unknown
  type?: string
}

/**
 * Strips HTML tags and trims whitespace from a string value.
 */
export function stripHtmlTags(str?: string | null): string {
  if (!str) return ''
  return str.replace(/<[^>]*>/g, '').trim()
}

/**
 * Sanitizes URL/href to prevent javascript:, vbscript:, or unsafe data: protocols.
 */
export function sanitizeCtaUrl(raw?: string, fallback = '/products'): string {
  if (!raw) return fallback
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed)) {
    return fallback
  }
  return trimmed
}

export function resolveImageUrl(url: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) return trimmed
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed)) return null
  const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/api/v1').replace(/\/api\/v1\/?$/, '')
  return `${baseUrl}${clean}`
}

// ─── Shared In-Memory Cache & In-Flight Deduplication ──────────
const CACHE_TTL_MS = 10_000
let cachedSettingsMap: Record<string, string> | null = null
let cacheTimestamp = 0
let inFlightSettingsPromise: Promise<Record<string, string>> | null = null

export function invalidatePageSettingsCache(): void {
  cachedSettingsMap = null
  cacheTimestamp = 0
  inFlightSettingsPromise = null
}

export async function getSettingsMapCached(force = false): Promise<Record<string, string>> {
  const now = Date.now()
  if (!force && cachedSettingsMap && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSettingsMap
  }

  if (!force && inFlightSettingsPromise) {
    return inFlightSettingsPromise
  }

  inFlightSettingsPromise = api
    .get('/cms/page-settings')
    .then((res) => {
      const raw = res?.data
      const map: Record<string, string> = {}
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>
        const data = unwrapData<BackendPageSetting[]>(obj) ?? (obj.data as unknown)
        if (Array.isArray(data)) {
          data.forEach((entry) => {
            if (entry && typeof entry === 'object') {
              const item = entry as BackendPageSetting
              if (typeof item.key === 'string' && item.value !== undefined && item.value !== null) {
                map[item.key] = typeof item.value === 'string' ? item.value : JSON.stringify(item.value)
              }
            }
          })
        }
      }
      cachedSettingsMap = map
      cacheTimestamp = Date.now()
      return map
    })
    .finally(() => {
      inFlightSettingsPromise = null
    })

  return inFlightSettingsPromise
}

export const bannerService = {
  invalidateCache(): void {
    invalidatePageSettingsCache()
  },

  async getHeroBanner(): Promise<string[]> {
    try {
      const map = await getSettingsMapCached()
      const value = map.home_hero_banners || map.hero_banner
      if (value) {
        try {
          const parsed: unknown = JSON.parse(value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === 'string') {
              return parsed
                .filter((x): x is string => typeof x === 'string' && x.length > 0)
                .map((u) => resolveImageUrl(u) ?? u)
            }
            if (typeof parsed[0] === 'object' && parsed[0] !== null) {
              const imgs = (parsed as Record<string, unknown>[])
                .map((o) => (typeof o.image === 'string' ? o.image : typeof o.url === 'string' ? o.url : typeof o.src === 'string' ? o.src : ''))
                .filter((s) => s.length > 0)
                .map((u) => resolveImageUrl(u) ?? u)
              if (imgs.length > 0) return imgs
            }
          }
          if (typeof parsed === 'string' && parsed.length > 0) return [resolveImageUrl(parsed) ?? parsed]
        } catch {
          return [resolveImageUrl(value) ?? value]
        }
      }
    } catch {
      // Fallback to default
    }
    return []
  },

  async getHeroBannerSlides(): Promise<RichBannerSlide[]> {
    try {
      const map = await getSettingsMapCached()
      const value = map.home_hero_banners || map.hero_banner
      if (value) {
        try {
          const parsed: unknown = JSON.parse(value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === 'object' && parsed[0] !== null) {
              const slides = (parsed as Record<string, unknown>[])
                .map((o): RichBannerSlide | null => {
                  const rawImg = typeof o.image === 'string' ? o.image : typeof o.url === 'string' ? o.url : typeof o.src === 'string' ? o.src : ''
                  const img = resolveImageUrl(rawImg) ?? rawImg
                  if (!img) return null
                  const rawHref = typeof o.ctaHref === 'string' ? o.ctaHref : typeof o.href === 'string' ? o.href : '/products'
                  return {
                    image: img,
                    badge: typeof o.badge === 'string' ? o.badge.trim() : '',
                    title: typeof o.title === 'string' ? o.title.trim() : '',
                    subtitle: typeof o.subtitle === 'string' ? o.subtitle.trim() : '',
                    ctaLabel: typeof o.ctaLabel === 'string' ? o.ctaLabel.trim() : '',
                    ctaHref: sanitizeCtaUrl(rawHref, '/products'),
                    mobileTemplate: typeof o.mobileTemplate === 'string' ? o.mobileTemplate : undefined,
                    mobileHeightPx: typeof o.mobileHeightPx === 'number' ? o.mobileHeightPx : undefined,
                  }
                })
                .filter((s): s is RichBannerSlide => s !== null)
              if (slides.length > 0) return slides
            }
            if (typeof parsed[0] === 'string') {
              return parsed
                .filter((x): x is string => typeof x === 'string' && x.length > 0)
                .map((u) => ({
                  image: resolveImageUrl(u) ?? u,
                  badge: '',
                  title: '',
                  subtitle: '',
                  ctaLabel: '',
                  ctaHref: '/products',
                }))
            }
          }
          if (typeof parsed === 'string' && parsed.length > 0) {
            return [{
              image: resolveImageUrl(parsed) ?? parsed,
              badge: '',
              title: '',
              subtitle: '',
              ctaLabel: '',
              ctaHref: '/products',
            }]
          }
        } catch {
          return [{
            image: resolveImageUrl(value) ?? value,
            badge: '',
            title: '',
            subtitle: '',
            ctaLabel: '',
            ctaHref: '/products',
          }]
        }
      }
    } catch {
      // Fallback
    }
    return []
  },

  async getLogo(): Promise<string | null> {
    try {
      const map = await getSettingsMapCached()
      const rawLogo = map.site_navbar_logo || map.logo_url || null
      return resolveImageUrl(rawLogo)
    } catch {
      return null
    }
  },

  async getSiteTitle(): Promise<string | null> {
    try {
      const map = await getSettingsMapCached()
      return stripHtmlTags(map.site_title) || null
    } catch {
      return null
    }
  },

  async getSiteTagline(): Promise<string | null> {
    try {
      const map = await getSettingsMapCached()
      return stripHtmlTags(map.site_tagline) || null
    } catch {
      return null
    }
  },

  async getContactEmail(): Promise<string | null> {
    try {
      const map = await getSettingsMapCached()
      return stripHtmlTags(map.contact_email) || null
    } catch {
      return null
    }
  },

  async getContactPhone(): Promise<string | null> {
    try {
      const map = await getSettingsMapCached()
      return stripHtmlTags(map.contact_phone) || null
    } catch {
      return null
    }
  },

  async getContactAddress(): Promise<string | null> {
    try {
      const map = await getSettingsMapCached()
      const val = map.contact_address || map.address || map.alamat || null
      return stripHtmlTags(val) || null
    } catch {
      return null
    }
  },

  async isPopupEnabled(): Promise<boolean> {
    try {
      const map = await getSettingsMapCached()
      const rawEnabled = stripHtmlTags(map.site_popup_enabled ?? map.popup_enabled ?? 'true')
      return rawEnabled === 'true' || rawEnabled === '1'
    } catch {
      return true
    }
  },

  async getPopupBannerData(): Promise<PopupBannerData | null> {
    try {
      const map = await getSettingsMapCached()
      const rawEnabled = map.site_popup_enabled ?? map.popup_enabled ?? 'true'
      const isEnabled = rawEnabled === 'true' || rawEnabled === '1'
      if (!isEnabled) {
        return null
      }
      const rawPopup = map.site_popup_banner || map.popup_banner || null
      if (!rawPopup) return null

      let image = ''
      let link = '/products'
      let mobileTemplate = 'square'
      let mobileMaxWidth = 320
      let mobileAspectRatio = '1 / 1'
      let objectFit: 'cover' | 'contain' = 'cover'

      try {
        const parsed = JSON.parse(rawPopup)
        if (typeof parsed === 'object' && parsed !== null) {
          image = typeof parsed.image === 'string' ? parsed.image : typeof parsed.img === 'string' ? parsed.img : ''
          link = typeof parsed.link === 'string' ? parsed.link : typeof parsed.url === 'string' ? parsed.url : '/products'
          if (typeof parsed.mobileTemplate === 'string' && parsed.mobileTemplate) {
            mobileTemplate = parsed.mobileTemplate
          }
          if (typeof parsed.mobileMaxWidth === 'number' && !isNaN(parsed.mobileMaxWidth)) {
            mobileMaxWidth = parsed.mobileMaxWidth
          }
          if (typeof parsed.mobileAspectRatio === 'string' && parsed.mobileAspectRatio) {
            mobileAspectRatio = parsed.mobileAspectRatio
          } else if (mobileTemplate === 'portrait_ig') {
            mobileAspectRatio = '4 / 5'
          } else if (mobileTemplate === 'poster_tall') {
            mobileAspectRatio = '3 / 4'
          } else if (mobileTemplate === 'compact_landscape') {
            mobileAspectRatio = '4 / 3'
          } else if (mobileTemplate === 'story_full') {
            mobileAspectRatio = '9 / 16'
          }
          if (parsed.objectFit === 'contain') {
            objectFit = 'contain'
          }
        } else if (typeof parsed === 'string') {
          image = parsed
        }
      } catch {
        image = rawPopup
      }

      const resolvedImage = resolveImageUrl(image)
      if (!resolvedImage) return null

      return {
        image: resolvedImage,
        link: sanitizeCtaUrl(link, '/products'),
        mobileTemplate,
        mobileMaxWidth,
        mobileAspectRatio,
        objectFit,
      }
    } catch {
      return null
    }
  },

  async getPopupBanner(): Promise<string | null> {
    const data = await this.getPopupBannerData()
    return data ? data.image : null
  },

  async getLogoConfig(): Promise<LogoConfigData> {
    const defaultData: LogoConfigData = {
      navbarMobilePreset: 'standard',
      navbarMobileHeightPx: 32,
      navbarDesktopHeightPx: 40,
      footerMobilePreset: 'standard',
      footerMobileHeightPx: 36,
      footerDesktopHeightPx: 44,
      maxWidthPx: 180,
    }
    try {
      const map = await getSettingsMapCached()
      if (map.site_logo_config) {
        const parsed = JSON.parse(map.site_logo_config)
        if (typeof parsed === 'object' && parsed !== null) {
          const navPx = Number(parsed.navbarMobileHeightPx) || 32
          const footPx =
            parsed.footerMobilePreset === 'sync'
              ? navPx
              : Number(parsed.footerMobileHeightPx) || 36
          return {
            navbarMobilePreset: parsed.navbarMobilePreset || 'standard',
            navbarMobileHeightPx: navPx,
            navbarDesktopHeightPx: Number(parsed.navbarDesktopHeightPx) || 40,
            footerMobilePreset: parsed.footerMobilePreset || 'standard',
            footerMobileHeightPx: footPx,
            footerDesktopHeightPx: Number(parsed.footerDesktopHeightPx) || 44,
            maxWidthPx: Number(parsed.maxWidthPx) || 180,
          }
        }
      }
    } catch {
      // fallback
    }
    return defaultData
  },
}
