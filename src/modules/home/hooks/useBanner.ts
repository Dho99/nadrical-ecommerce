import { useEffect, useState } from 'react'
import { bannerService, type RichBannerSlide } from '../services/banner.service'
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
        const [e, p] = await Promise.all([
          bannerService.getContactEmail(),
          bannerService.getContactPhone(),
        ])
        setEmail(e)
        setPhone(p)
      } catch {
        setEmail(null)
        setPhone(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [attempt])

  return { email, phone, loading }
}

export function usePopupBanner() {
  const [popupBanner, setPopupBanner] = useState<string | null>(null)
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
        const banner = await bannerService.getPopupBanner()
        setPopupBanner(banner)
      } catch {
        setPopupBanner(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [attempt])

  return { popupBanner, loading }
}
