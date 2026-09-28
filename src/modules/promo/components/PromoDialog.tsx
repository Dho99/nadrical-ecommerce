import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { promoService, type PromoDialog as PromoDialogType } from '../services/promo.service'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button } from '../../../shared/components/ui'

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
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleClose()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        {promo.image_url && (
          <div className="relative w-full overflow-hidden rounded-t-lg">
            <img src={promo.image_url} alt={promo.title} className="aspect-video w-full object-cover" />
          </div>
        )}
        <div className="space-y-4 p-6">
          <div>
            <DialogHeader className="mb-2">
              <DialogTitle className="text-2xl font-bold">{promo.title}</DialogTitle>
            </DialogHeader>
            {promo.description && (
              <DialogDescription className="text-base text-muted-foreground mt-2">{promo.description}</DialogDescription>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {promo.cta_link && (
              <Button onClick={handleCTA} size="lg" className="w-full">
                {promo.cta_text || 'Learn More'}
              </Button>
            )}
            <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
              Close
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 rounded-full bg-background/80 p-1 hover:bg-background"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>
      </DialogContent>
    </Dialog>
  )
}
