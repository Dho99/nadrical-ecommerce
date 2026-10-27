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

/**
 * Shared hook to synchronize settings and banners in real time via WebSockets and window focus.
 */
function useCmsRefreshTrigger(includeBanners = false): number {
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const triggerRealtimeRefetch = () => {
      bannerService.invalidateCache()
      setAttempt((a) => a + 1)
    }
    const triggerFocusRefetch = () => setAttempt((a) => a + 1)

    const unsubs: Array<() => void> = []

    if (includeBanners) {
      unsubs.push(websocketService.on('banners_updated', triggerRealtimeRefetch))
    }
    unsubs.push(websocketService.on('settings_updated', triggerRealtimeRefetch))
    unsubs.push(
      websocketService.on('data_updated', (payload: unknown) => {
        const p = payload as WsUpdatePayload | undefined
        if (!p || p.resource === 'settings' || (includeBanners && p.resource === 'banners')) {
          triggerRealtimeRefetch()
        }
      })
    )
    window.addEventListener('focus', triggerFocusRefetch)

    return () => {
      unsubs.forEach((unsub) => unsub())
      window.removeEventListener('focus', triggerFocusRefetch)
    }
  }, [includeBanners])

  return attempt
}

export function useBannerSlides() {
  const [slides, setSlides] = useState<RichBannerSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const attempt = useCmsRefreshTrigger(true)

  useEffect(() => {
    let isMounted = true
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const loadedSlides = await bannerService.getHeroBannerSlides()
        if (isMounted) {
          setSlides(loadedSlides)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load banners')
          setSlides([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchBanners()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return { slides, loading, error }
}

export function useBannerImages() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const attempt = useCmsRefreshTrigger(true)

  useEffect(() => {
    let isMounted = true
    const fetchBanners = async () => {
      try {
        setLoading(true)
        const banners = await bannerService.getHeroBanner()
        if (isMounted) {
          setImages(banners)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load banners')
          setImages([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchBanners()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return { images, loading, error }
}

export function useLogo() {
  const [logo, setLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const attempt = useCmsRefreshTrigger(false)

  useEffect(() => {
    let isMounted = true
    const fetchLogo = async () => {
      try {
        setLoading(true)
        const logoUrl = await bannerService.getLogo()
        if (isMounted) setLogo(logoUrl)
      } catch {
        if (isMounted) setLogo(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchLogo()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return { logo, loading }
}

export function useSiteTitle() {
  const [title, setTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const attempt = useCmsRefreshTrigger(false)

  useEffect(() => {
    let isMounted = true
    const fetchTitle = async () => {
      try {
        setLoading(true)
        const siteTitle = await bannerService.getSiteTitle()
        if (isMounted) setTitle(siteTitle)
      } catch {
        if (isMounted) setTitle(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchTitle()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return { title, loading }
}

export function useSiteTagline() {
  const [tagline, setTagline] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const attempt = useCmsRefreshTrigger(false)

  useEffect(() => {
    let isMounted = true
    const fetchTagline = async () => {
      try {
        setLoading(true)
        const siteTagline = await bannerService.getSiteTagline()
        if (isMounted) setTagline(siteTagline)
      } catch {
        if (isMounted) setTagline(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchTagline()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return { tagline, loading }
}

export function useContactInfo() {
  const [email, setEmail] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const attempt = useCmsRefreshTrigger(false)

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      try {
        setLoading(true)
        const [e, p, a] = await Promise.all([
          bannerService.getContactEmail(),
          bannerService.getContactPhone(),
          bannerService.getContactAddress(),
        ])
        if (isMounted) {
          setEmail(e)
          setPhone(p)
          setAddress(a)
        }
      } catch {
        if (isMounted) {
          setEmail(null)
          setPhone(null)
          setAddress(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetch()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return { email, phone, address, loading }
}

export function usePopupBanner() {
  const [popupBanner, setPopupBanner] = useState<string | null>(null)
  const [popupMobileImage, setPopupMobileImage] = useState<string | null>(null)
  const [popupLink, setPopupLink] = useState<string>('/products')
  const [isPopupEnabled, setIsPopupEnabled] = useState<boolean>(true)
  const [desktopTemplate, setDesktopTemplate] = useState<string>('square')
  const [desktopMaxWidth, setDesktopMaxWidth] = useState<number>(480)
  const [desktopAspectRatio, setDesktopAspectRatio] = useState<string>('1 / 1')
  const [mobileTemplate, setMobileTemplate] = useState<string>('square')
  const [mobileMaxWidth, setMobileMaxWidth] = useState<number>(320)
  const [mobileAspectRatio, setMobileAspectRatio] = useState<string>('1 / 1')
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover')
  const [loading, setLoading] = useState(true)
  const attempt = useCmsRefreshTrigger(false)

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      try {
        setLoading(true)
        const [bannerData, enabled] = await Promise.all([
          bannerService.getPopupBannerData(),
          bannerService.isPopupEnabled(),
        ])
        if (isMounted) {
          setPopupBanner(bannerData?.image ?? null)
          setPopupMobileImage(bannerData?.mobileImage ?? null)
          setPopupLink(bannerData?.link ?? '/products')
          setIsPopupEnabled(enabled)
          setDesktopTemplate(bannerData?.desktopTemplate ?? 'square')
          setDesktopMaxWidth(bannerData?.desktopMaxWidth ?? 480)
          setDesktopAspectRatio(bannerData?.desktopAspectRatio ?? '1 / 1')
          setMobileTemplate(bannerData?.mobileTemplate ?? 'square')
          setMobileMaxWidth(bannerData?.mobileMaxWidth ?? 320)
          setMobileAspectRatio(bannerData?.mobileAspectRatio ?? '1 / 1')
          setObjectFit(bannerData?.objectFit ?? 'cover')
        }
      } catch {
        if (isMounted) {
          setPopupBanner(null)
          setPopupMobileImage(null)
          setPopupLink('/products')
          setIsPopupEnabled(false)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetch()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return {
    popupBanner,
    popupMobileImage,
    popupLink,
    isPopupEnabled,
    desktopTemplate,
    desktopMaxWidth,
    desktopAspectRatio,
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
  const attempt = useCmsRefreshTrigger(false)

  useEffect(() => {
    let isMounted = true
    const fetchConfig = async () => {
      try {
        setLoading(true)
        const cfg = await bannerService.getLogoConfig()
        if (isMounted) setConfig(cfg)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchConfig()
    return () => {
      isMounted = false
    }
  }, [attempt])

  return { config, loading }
}
