import { MapPin } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import type { ShipmentEvent, ShipmentInfo } from '../types/shipment.type'

interface ShipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  info: ShipmentInfo
  events: ShipmentEvent[]
}

function fmtTime(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ShipmentDialog({ open, onOpenChange, info, events }: ShipmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold tracking-tight">Shipment tracking</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="font-semibold">{info.courier}</p>
          <p className="font-mono text-xs text-muted-foreground">Tracking: {info.tracking}</p>
          <span className="mt-1 inline-block rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            {info.statusLabel}
          </span>
        </div>

        <ol className="space-y-0" aria-label="Shipment journey">
          {events.map((evt, i) => (
            <li key={evt.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
                    evt.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background',
                  )}
                >
                  {evt.done ? <MapPin className="size-3" /> : i + 1}
                </span>
                {i < events.length - 1 && (
                  <span className={cn('w-0.5 flex-1', evt.done ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
              <div className={cn('pb-5', !evt.done && 'opacity-60')}>
                <p className="text-sm font-semibold">{evt.title}</p>
                {evt.location && <p className="text-xs text-muted-foreground">{evt.location}</p>}
                {evt.time && <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{fmtTime(evt.time)}</p>}
              </div>
            </li>
          ))}
        </ol>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
