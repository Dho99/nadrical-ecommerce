import api, { unwrapData } from '../../../shared/lib/api'

export interface BannerSetting {
  uuid?: string
  key: string
  value: string
}

export interface RichBannerSlide {
  image: string
  imageMobile?: string
  badge?: string
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  desktopTemplate?: string
  desktopHeightPx?: number
  mobileTemplate?: string
  mobileHeightPx?: number
}

export interface PopupBannerData {
  image: string
  mobileImage?: string
  link: string
  desktopTemplate?: string
  desktopMaxWidth?: number
  desktopAspectRatio?: string
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

const ALLOWED_ASPECT_RATIOS = new Set([
  '1 / 1',
  '4 / 3',
  '4 / 5',
  '3 / 4',
  '16 / 9',
  '9 / 16',
  '2 / 1',
  'auto',
])

export function clampPx(val: unknown, min: number, max: number, fallback: number): number {
  const num = typeof val === 'number' ? val : Number(val)
  if (isNaN(num)) return fallback
  return Math.min(Math.max(Math.round(num), min), max)
}

export function sanitizeAspectRatio(val: unknown, fallback = '1 / 1'): string {
  if (typeof val !== 'string') return fallback
  const clean = val.trim()
  if (ALLOWED_ASPECT_RATIOS.has(clean)) return clean
  return fallback
}

/**
 * Sanitizes URL/href to prevent protocol-relative (//), javascript:, vbscript:, or unsafe data: protocols.
 */
export function sanitizeCtaUrl(raw?: string, fallback = '/products'): string {
  if (!raw) return fallback
  const clean = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (!clean) return fallback
  if (clean.startsWith('//')) return fallback
  if (/^https?:\/\//i.test(clean)) return clean
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(clean)) return fallback
  if (clean.startsWith('/') || clean.startsWith('#')) return clean
  return fallback
}

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (!trimmed) return null
  if (trimmed.startsWith('//')) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(trimmed)) return trimmed
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
                .map((u) => (typeof u === 'string' ? resolveImageUrl(u) : null))
                .filter((x): x is string => typeof x === 'string' && x.length > 0)
            }
            if (typeof parsed[0] === 'object' && parsed[0] !== null) {
              const imgs = (parsed as Record<string, unknown>[])
                .map((o) => {
                  const raw = typeof o.image === 'string' ? o.image : typeof o.url === 'string' ? o.url : typeof o.src === 'string' ? o.src : ''
                  return resolveImageUrl(raw)
                })
                .filter((s): s is string => typeof s === 'string' && s.length > 0)
              if (imgs.length > 0) return imgs
            }
          }
          if (typeof parsed === 'string' && parsed.length > 0) {
            const resolved = resolveImageUrl(parsed)
            return resolved ? [resolved] : []
          }
        } catch {
          const resolved = resolveImageUrl(value)
          return resolved ? [resolved] : []
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
                  const img = resolveImageUrl(rawImg)
                  if (!img) return null
                  const rawMobImg = typeof o.imageMobile === 'string' ? o.imageMobile : typeof o.mobileImage === 'string' ? o.mobileImage : ''
                  const imgMobile = rawMobImg && rawMobImg !== 'pending' ? (resolveImageUrl(rawMobImg) ?? undefined) : undefined
                  const rawHref = typeof o.ctaHref === 'string' ? o.ctaHref : typeof o.href === 'string' ? o.href : '/products'
                  return {
                    image: img,
                    imageMobile: imgMobile,
                    badge: typeof o.badge === 'string' ? o.badge.trim() : '',
                    title: typeof o.title === 'string' ? o.title.trim() : '',
                    subtitle: typeof o.subtitle === 'string' ? o.subtitle.trim() : '',
                    ctaLabel: typeof o.ctaLabel === 'string' ? o.ctaLabel.trim() : '',
                    ctaHref: sanitizeCtaUrl(rawHref, '/products'),
                    desktopTemplate: typeof o.desktopTemplate === 'string' ? o.desktopTemplate : undefined,
                    desktopHeightPx: typeof o.desktopHeightPx === 'number' ? clampPx(o.desktopHeightPx, 280, 900, 480) : undefined,
                    mobileTemplate: typeof o.mobileTemplate === 'string' ? o.mobileTemplate : undefined,
                    mobileHeightPx: typeof o.mobileHeightPx === 'number' ? clampPx(o.mobileHeightPx, 140, 500, 205) : undefined,
                  }
                })
                .filter((s): s is RichBannerSlide => s !== null)
              if (slides.length > 0) return slides
            }
            if (typeof parsed[0] === 'string') {
              const stringSlides: RichBannerSlide[] = []
              for (const u of parsed) {
                if (typeof u === 'string') {
                  const img = resolveImageUrl(u)
                  if (img) {
                    stringSlides.push({
                      image: img,
                      badge: '',
                      title: '',
                      subtitle: '',
                      ctaLabel: '',
                      ctaHref: '/products',
                    })
                  }
                }
              }
              return stringSlides
            }
          }
          if (typeof parsed === 'string' && parsed.length > 0) {
            const img = resolveImageUrl(parsed)
            if (img) {
              return [{
                image: img,
                badge: '',
                title: '',
                subtitle: '',
                ctaLabel: '',
                ctaHref: '/products',
              }]
            }
          }
        } catch {
          const img = resolveImageUrl(value)
          if (img) {
            return [{
              image: img,
              badge: '',
              title: '',
              subtitle: '',
              ctaLabel: '',
              ctaHref: '/products',
            }]
          }
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
      let mobileImage: string | undefined = undefined
      let link = '/products'
      let desktopTemplate = 'square'
      let desktopMaxWidth = 480
      let desktopAspectRatio = '1 / 1'
      let mobileTemplate = 'square'
      let mobileMaxWidth = 320
      let mobileAspectRatio = '1 / 1'
      let objectFit: 'cover' | 'contain' = 'cover'

      try {
        const parsed = JSON.parse(rawPopup)
        if (typeof parsed === 'object' && parsed !== null) {
          image =
            typeof parsed.image === 'string'
              ? parsed.image
              : typeof parsed.img === 'string'
                ? parsed.img
                : ''
          const rawMob =
            typeof parsed.mobileImage === 'string'
              ? parsed.mobileImage
              : typeof parsed.imageMobile === 'string'
                ? parsed.imageMobile
                : ''
          if (rawMob && rawMob !== 'pending') {
            mobileImage = resolveImageUrl(rawMob) ?? undefined
          }
          link =
            typeof parsed.link === 'string'
              ? parsed.link
              : typeof parsed.url === 'string'
                ? parsed.url
                : '/products'

          if (typeof parsed.desktopTemplate === 'string' && parsed.desktopTemplate) {
            desktopTemplate = parsed.desktopTemplate
          }
          desktopMaxWidth = clampPx(parsed.desktopMaxWidth, 360, 800, 480)

          if (desktopTemplate === 'custom') {
            desktopAspectRatio = 'auto'
          } else if (desktopTemplate === 'landscape') {
            desktopAspectRatio = sanitizeAspectRatio(parsed.desktopAspectRatio, '4 / 3')
          } else if (desktopTemplate === 'portrait') {
            desktopAspectRatio = sanitizeAspectRatio(parsed.desktopAspectRatio, '4 / 5')
          } else if (desktopTemplate === 'wide') {
            desktopAspectRatio = sanitizeAspectRatio(parsed.desktopAspectRatio, '16 / 9')
          } else {
            desktopAspectRatio = sanitizeAspectRatio(parsed.desktopAspectRatio, '1 / 1')
          }

          if (typeof parsed.mobileTemplate === 'string' && parsed.mobileTemplate) {
            mobileTemplate = parsed.mobileTemplate
          }
          mobileMaxWidth = clampPx(parsed.mobileMaxWidth, 240, 420, 320)

          if (mobileTemplate === 'custom') {
            mobileAspectRatio = 'auto'
          } else if (mobileTemplate === 'portrait_ig' || mobileTemplate === 'portrait') {
            mobileAspectRatio = sanitizeAspectRatio(parsed.mobileAspectRatio, '4 / 5')
          } else if (mobileTemplate === 'poster_tall') {
            mobileAspectRatio = sanitizeAspectRatio(parsed.mobileAspectRatio, '3 / 4')
          } else if (mobileTemplate === 'compact_landscape' || mobileTemplate === 'landscape') {
            mobileAspectRatio = sanitizeAspectRatio(parsed.mobileAspectRatio, '4 / 3')
          } else if (mobileTemplate === 'story_full') {
            mobileAspectRatio = sanitizeAspectRatio(parsed.mobileAspectRatio, '9 / 16')
          } else {
            mobileAspectRatio = sanitizeAspectRatio(parsed.mobileAspectRatio, '1 / 1')
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
        mobileImage,
        link: sanitizeCtaUrl(link, '/products'),
        desktopTemplate,
        desktopMaxWidth,
        desktopAspectRatio,
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
      maxWidthPx: 220,
    }
    try {
      const map = await getSettingsMapCached()
      if (map.site_logo_config) {
        const parsed = JSON.parse(map.site_logo_config)
        if (typeof parsed === 'object' && parsed !== null) {
          const navMobPresetMap: Record<string, number> = {
            compact: 24,
            standard: 32,
            large: 40,
            prominent: 48,
          }
          const navDeskPresetMap: Record<string, number> = {
            compact: 32,
            standard: 40,
            large: 52,
          }
          const footMobPresetMap: Record<string, number> = {
            compact: 28,
            standard: 36,
            large: 48,
          }
          const footDeskPresetMap: Record<string, number> = {
            compact: 36,
            standard: 44,
            large: 60,
          }

          const navMobPx =
            typeof parsed.navbarMobilePreset === 'string' &&
            parsed.navbarMobilePreset in navMobPresetMap
              ? navMobPresetMap[parsed.navbarMobilePreset]
              : Number(parsed.navbarMobileHeightPx) || 32

          const navDeskPx =
            typeof parsed.navbarDesktopPreset === 'string' &&
            parsed.navbarDesktopPreset in navDeskPresetMap
              ? navDeskPresetMap[parsed.navbarDesktopPreset]
              : Number(parsed.navbarDesktopHeightPx) || 40

          const footMobPx =
            parsed.footerMobilePreset === 'sync'
              ? navMobPx
              : typeof parsed.footerMobilePreset === 'string' &&
                  parsed.footerMobilePreset in footMobPresetMap
                ? footMobPresetMap[parsed.footerMobilePreset]
                : Number(parsed.footerMobileHeightPx) || 36

          const footDeskPx =
            parsed.footerDesktopPreset === 'sync'
              ? navDeskPx
              : typeof parsed.footerDesktopPreset === 'string' &&
                  parsed.footerDesktopPreset in footDeskPresetMap
                ? footDeskPresetMap[parsed.footerDesktopPreset]
                : Number(parsed.footerDesktopHeightPx) ||
                  (parsed.footerMobilePreset === 'sync' ? navDeskPx : 44)

          return {
            navbarMobilePreset: parsed.navbarMobilePreset || 'standard',
            navbarMobileHeightPx: navMobPx,
            navbarDesktopHeightPx: navDeskPx,
            footerMobilePreset: parsed.footerMobilePreset || 'standard',
            footerMobileHeightPx: footMobPx,
            footerDesktopHeightPx: footDeskPx,
            maxWidthPx: clampPx(parsed.maxWidthPx, 100, 400, 220),
          }
        }
      }
    } catch {
      // fallback
    }
    return defaultData
  },
}
