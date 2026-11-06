import { useEffect, useState } from 'react'
import { promoService, type PromoDialog as PromoDialogType } from '../services/promo.service'
import { Button } from '../../../shared/components/ui'
import { ResponsiveDialog } from '../../../shared/components/ResponsiveDialog'

export function PromoDialog() {
  const [open, setOpen] = useState(false)
  const [promo, setPromo] = useState<PromoDialogType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storageKey = `promo_seen_${new Date().toISOString().split('T')[0]}`
    const alreadySeen = localStorage.getItem(storageKey)

    if (alreadySeen) {
      setTimeout(() => setLoading(false), 0)
      return
    }

    const fetchPromo = async () => {
      try {
        const promos = await promoService.getActive()
        if (promos.length > 0) {
          setPromo(promos[0])
          setOpen(true)
        }
      } catch {
        setPromo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPromo()
  }, [])

  const handleClose = () => {
    setOpen(false)
    const storageKey = `promo_seen_${new Date().toISOString().split('T')[0]}`
    localStorage.setItem(storageKey, '1')
  }

  const handleCTA = () => {
    handleClose()
    if (promo?.cta_link) {
      window.location.href = promo.cta_link
    }
  }

  if (loading || !promo) return null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => !next && handleClose()}
      title={promo.title}
      description={promo.description}
      desktopClassName="max-w-lg gap-0 p-0"
      mobileClassName="max-h-[85dvh]"
    >
      {promo.image_url && (
        <div className="relative w-full overflow-hidden rounded-lg">
          <img src={promo.image_url} alt={promo.title} className="aspect-video w-full object-cover" />
        </div>
      )}
      <div className="flex flex-col gap-2 p-5 pt-4">
        {promo.cta_link && (
          <Button onClick={handleCTA} size="lg" className="w-full">
            {promo.cta_text || 'Learn More'}
          </Button>
        )}
        <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
          Close
        </Button>
      </div>
    </ResponsiveDialog>
  )
}
