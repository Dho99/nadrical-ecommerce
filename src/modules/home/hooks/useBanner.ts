import { useEffect, useState } from 'react'
import {
  bannerService,
  type RichBannerSlide,
  type LogoConfigData,
} from '../services/banner.service'
import { websocketService } from '../../../shared/lib/websocket'

interface WsUpdatePayload {
  resource?: string
}

export function useBannerSlides() {
  const [slides, setSlides] = useState<RichBannerSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtimeRefetch = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocusRefetch = () => setAttempt((a) => a + 1)

    const unsub1 = websocketService.on('banners_updated', triggerRealtimeRefetch)
    const unsub2 = websocketService.on('settings_updated', triggerRealtimeRefetch)
    const unsub3 = websocketService.on('data_updated', (payload: unknown) => {
      const p = payload as WsUpdatePayload | undefined
      if (!p || p.resource === 'settings' || p.resource === 'banners') {
        triggerRealtimeRefetch()
      }
    })
    window.addEventListener('focus', triggerFocusRefetch)

    return () => {
      unsub1()
      unsub2()
      unsub3()
      window.removeEventListener('focus', triggerFocusRefetch)
    }
  }, [])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const loadedSlides = await bannerService.getHeroBannerSlides()
        setSlides(loadedSlides)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load banners')
        setSlides([])
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [attempt])

  return { slides, loading, error }
}

export function useBannerImages() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtimeRefetch = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocusRefetch = () => setAttempt((a) => a + 1)

    const unsub1 = websocketService.on('banners_updated', triggerRealtimeRefetch)
    const unsub2 = websocketService.on('settings_updated', triggerRealtimeRefetch)
    const unsub3 = websocketService.on('data_updated', (payload: unknown) => {
      const p = payload as WsUpdatePayload | undefined
      if (!p || p.resource === 'settings' || p.resource === 'banners') {
        triggerRealtimeRefetch()
      }
    })
    window.addEventListener('focus', triggerFocusRefetch)

    return () => {
      unsub1()
      unsub2()
      unsub3()
      window.removeEventListener('focus', triggerFocusRefetch)
    }
  }, [])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const banners = await bannerService.getHeroBanner()
        setImages(banners)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load banners')
        setImages([])
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [attempt])

  return { images, loading, error }
}

export function useLogo() {
  const [logo, setLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtimeRefetch = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocusRefetch = () => setAttempt((a) => a + 1)

    const unsub1 = websocketService.on('settings_updated', triggerRealtimeRefetch)
    const unsub2 = websocketService.on('data_updated', (payload: unknown) => {
      const p = payload as WsUpdatePayload | undefined
      if (!p || p.resource === 'settings') {
        triggerRealtimeRefetch()
      }
    })
    window.addEventListener('focus', triggerFocusRefetch)

    return () => {
      unsub1()
      unsub2()
      window.removeEventListener('focus', triggerFocusRefetch)
    }
  }, [])

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true)
        const logoUrl = await bannerService.getLogo()
        setLogo(logoUrl)
      } catch {
        setLogo(null)
      } finally {
        setLoading(false)
      }
    }
    fetchLogo()
  }, [attempt])

  return { logo, loading }
}

export function useSiteTitle() {
  const [title, setTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtimeRefetch = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocusRefetch = () => setAttempt((a) => a + 1)

    const unsub1 = websocketService.on('settings_updated', triggerRealtimeRefetch)
    const unsub2 = websocketService.on('data_updated', (payload: unknown) => {
      const p = payload as WsUpdatePayload | undefined
      if (!p || p.resource === 'settings') {
        triggerRealtimeRefetch()
      }
    })
    window.addEventListener('focus', triggerFocusRefetch)

    return () => {
      unsub1()
      unsub2()
      window.removeEventListener('focus', triggerFocusRefetch)
    }
  }, [])

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        setLoading(true)
        const siteTitle = await bannerService.getSiteTitle()
        setTitle(siteTitle)
      } catch {
        setTitle(null)
      } finally {
        setLoading(false)
      }
    }
    fetchTitle()
  }, [attempt])

  return { title, loading }
}

export function useSiteTagline() {
  const [tagline, setTagline] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtimeRefetch = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocusRefetch = () => setAttempt((a) => a + 1)

    const unsub1 = websocketService.on('settings_updated', triggerRealtimeRefetch)
    const unsub2 = websocketService.on('data_updated', (payload: unknown) => {
      const p = payload as WsUpdatePayload | undefined
      if (!p || p.resource === 'settings') {
        triggerRealtimeRefetch()
      }
    })
    window.addEventListener('focus', triggerFocusRefetch)

    return () => {
      unsub1()
      unsub2()
      window.removeEventListener('focus', triggerFocusRefetch)
    }
  }, [])

  useEffect(() => {
    const fetchTagline = async () => {
      try {
        setLoading(true)
        const siteTagline = await bannerService.getSiteTagline()
        setTagline(siteTagline)
      } catch {
        setTagline(null)
      } finally {
        setLoading(false)
      }
    }
    fetchTagline()
  }, [attempt])

  return { tagline, loading }
}

export function useContactInfo() {
  const [email, setEmail] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtime = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocus = () => setAttempt((a) => a + 1)
    const unsub = websocketService.on('settings_updated', triggerRealtime)
    window.addEventListener('focus', triggerFocus)
    return () => {
      unsub()
      window.removeEventListener('focus', triggerFocus)
    }
  }, [])

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const [e, p, a] = await Promise.all([
          bannerService.getContactEmail(),
          bannerService.getContactPhone(),
          bannerService.getContactAddress(),
        ])
        setEmail(e)
        setPhone(p)
        setAddress(a)
      } catch {
        setEmail(null)
        setPhone(null)
        setAddress(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [attempt])

  return { email, phone, address, loading }
}

export function usePopupBanner() {
  const [popupBanner, setPopupBanner] = useState<string | null>(null)
  const [popupLink, setPopupLink] = useState<string>('/products')
  const [isPopupEnabled, setIsPopupEnabled] = useState<boolean>(true)
  const [mobileTemplate, setMobileTemplate] = useState<string>('square')
  const [mobileMaxWidth, setMobileMaxWidth] = useState<number>(320)
  const [mobileAspectRatio, setMobileAspectRatio] = useState<string>('1 / 1')
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover')
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtime = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocus = () => setAttempt((a) => a + 1)
    const unsub = websocketService.on('settings_updated', triggerRealtime)
    window.addEventListener('focus', triggerFocus)
    return () => {
      unsub()
      window.removeEventListener('focus', triggerFocus)
    }
  }, [])

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const [bannerData, enabled] = await Promise.all([
          bannerService.getPopupBannerData(),
          bannerService.isPopupEnabled(),
        ])
        setPopupBanner(bannerData?.image ?? null)
        setPopupLink(bannerData?.link ?? '/products')
        setIsPopupEnabled(enabled)
        setMobileTemplate(bannerData?.mobileTemplate ?? 'square')
        setMobileMaxWidth(bannerData?.mobileMaxWidth ?? 320)
        setMobileAspectRatio(bannerData?.mobileAspectRatio ?? '1 / 1')
        setObjectFit(bannerData?.objectFit ?? 'cover')
      } catch {
        setPopupBanner(null)
        setPopupLink('/products')
        setIsPopupEnabled(false)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [attempt])

  return {
    popupBanner,
    popupLink,
    isPopupEnabled,
    mobileTemplate,
    mobileMaxWidth,
    mobileAspectRatio,
    objectFit,
    loading,
  }
}

export function useLogoConfig() {
  const [config, setConfig] = useState<LogoConfigData>({
    navbarMobilePreset: 'standard',
    navbarMobileHeightPx: 32,
    navbarDesktopHeightPx: 40,
    footerMobilePreset: 'standard',
    footerMobileHeightPx: 36,
    footerDesktopHeightPx: 44,
    maxWidthPx: 180,
  })
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtime = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocus = () => setAttempt((a) => a + 1)
    const unsub = websocketService.on('settings_updated', triggerRealtime)
    window.addEventListener('focus', triggerFocus)
    return () => {
      unsub()
      window.removeEventListener('focus', triggerFocus)
    }
  }, [])

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)
        const cfg = await bannerService.getLogoConfig()
        setConfig(cfg)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [attempt])

  return { config, loading }
}
