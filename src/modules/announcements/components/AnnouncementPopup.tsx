import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  Button,
} from '../../../shared/components/ui'
import { useAnnouncements } from '../hooks/useAnnouncements'

const STORAGE_KEY = 'announcement-last-shown'

export function AnnouncementPopup() {
  const { announcements } = useAnnouncements()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (announcements.length === 0) return

    const lastShown = localStorage.getItem(STORAGE_KEY)
    const now = Date.now()

    if (!lastShown || now - parseInt(lastShown) > 24 * 60 * 60 * 1000) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- show announcement popup once per day after fetching
      setOpen(true)
      localStorage.setItem(STORAGE_KEY, String(now))
    }
  }, [announcements])

  if (announcements.length === 0) return null

  const current = announcements[currentIndex]
  if (!current) return null

  const handleNext = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setOpen(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>{current.title}</AlertDialogTitle>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="mt-4 text-sm">
          {current.content}
        </AlertDialogDescription>
        <div className="mt-6 flex items-center justify-between gap-2 border-t pt-4">
          <div className="text-xs text-muted-foreground">
            {currentIndex + 1} / {announcements.length}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleNext}
            >
              {currentIndex === announcements.length - 1 ? 'Tutup' : 'Selanjutnya'}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
