import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'
import { usePopupBanner } from '../../modules/home/hooks/useBanner'

export function PromoPopupModal() {
  const { popupBanner } = usePopupBanner()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!popupBanner) return
    const isClosed = sessionStorage.getItem('ecommerce_promo_popup_closed')
    if (!isClosed) {
      const timer = setTimeout(() => setIsOpen(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [popupBanner])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('ecommerce_promo_popup_closed', 'true')
  }

  if (!isOpen || !popupBanner) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-lg w-full overflow-hidden rounded-2xl bg-background border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
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

        {/* Promo Image */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-muted">
          <img
            src={popupBanner}
            alt="Promo Spesial"
            className="h-full w-full object-cover"
          />
        </div>

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
            <Link
              to="/products"
              onClick={handleClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition"
            >
              Lihat Produk
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
