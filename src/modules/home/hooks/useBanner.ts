import { useEffect, useState } from 'react'
import { bannerService } from '../services/banner.service'

export function useBannerImages() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [])

  return { images, loading, error }
}

export function useLogo() {
  const [logo, setLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [])

  return { logo, loading }
}

export function useSiteTitle() {
  const [title, setTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [])

  return { title, loading }
}

export function useSiteTagline() {
  const [tagline, setTagline] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [])

  return { tagline, loading }
}
