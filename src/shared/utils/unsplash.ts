export function unsplashUrl(photo: string, w = 800): string {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&q=80`
}

export interface GalleryImageVariant {
  url: string
  label: string
  crop?: string
}

const CROP_VARIANTS: Array<{ label: string; crop: string; w: number }> = [
  { label: 'Full view', crop: 'entropy', w: 1200 },
  { label: 'Top view', crop: 'top', w: 1200 },
  { label: 'Bottom view', crop: 'bottom', w: 1200 },
  { label: 'Close-up', crop: 'edges', w: 1600 },
]

export function galleryVariants(url: string): GalleryImageVariant[] {
  if (!url || !url.startsWith('https://images.unsplash.com/')) {
    return url ? [{ url, label: 'Full view' }] : []
  }
  const sep = url.includes('?') ? '&' : '?'
  return CROP_VARIANTS.map((v) => ({
    url: `${url}${sep}crop=${v.crop}&w=${v.w}`,
    label: v.label,
    crop: v.crop,
  }))
}
