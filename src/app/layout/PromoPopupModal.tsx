import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'
import { usePopupBanner } from '../../modules/home/hooks/useBanner'

export function PromoPopupModal() {
  const {
    popupBanner,
    popupLink,
    isPopupEnabled,
    mobileMaxWidth,
    mobileAspectRatio,
    objectFit,
  } = usePopupBanner()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!popupBanner || !isPopupEnabled) {
      setIsOpen(false)
      return undefined
    }
    const isClosed = sessionStorage.getItem('ecommerce_promo_popup_closed')
    if (!isClosed) {
      const timer = setTimeout(() => setIsOpen(true), 1200)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [popupBanner, isPopupEnabled])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('ecommerce_promo_popup_closed', 'true')
  }

  if (!isOpen || !popupBanner || !isPopupEnabled) return null

  const isExternal =
    popupLink.startsWith('http://') ||
    popupLink.startsWith('https://') ||
    popupLink.startsWith('//')

  const effectiveAspectRatio =
    mobileAspectRatio && mobileAspectRatio !== 'auto'
      ? mobileAspectRatio
      : '1 / 1'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[var(--popup-mobile-w)] sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-background border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={
          {
            '--popup-mobile-w': `${mobileMaxWidth || 320}px`,
          } as React.CSSProperties
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
          aria-label="Tutup"
        >
          <X className="size-4" />
        </button>

        {/* Promo Image (Clickable) */}
        {isExternal ? (
          <a
            href={popupLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="block relative w-full max-h-[68vh] overflow-hidden bg-muted cursor-pointer group"
            style={{
              aspectRatio: effectiveAspectRatio,
            }}
          >
            <img
              src={popupBanner}
              alt="Promo Spesial"
              className="h-full w-full transition duration-300 group-hover:scale-102"
              style={{
                objectFit: objectFit || 'cover',
              }}
            />
          </a>
        ) : (
          <Link
            to={popupLink}
            onClick={handleClose}
            className="block relative w-full max-h-[68vh] overflow-hidden bg-muted cursor-pointer group"
            style={{
              aspectRatio: effectiveAspectRatio,
            }}
          >
            <img
              src={popupBanner}
              alt="Promo Spesial"
              className="h-full w-full transition duration-300 group-hover:scale-102"
              style={{
                objectFit: objectFit || 'cover',
              }}
            />
          </Link>
        )}

        {/* Footer Action */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-card border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Penawaran Spesial</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent transition"
            >
              Nanti Saja
            </button>
            {isExternal ? (
              <a
                href={popupLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition"
              >
                Lihat Produk
              </a>
            ) : (
              <Link
                to={popupLink}
                onClick={handleClose}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition"
              >
                Lihat Produk
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
