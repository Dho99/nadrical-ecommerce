import { useState } from 'react'
import { ChevronDown, Copy, MapPin, Truck } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { Button } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { shipmentService } from '../services/shipment.service'
import type { OrderWithItems } from '../types/order.type'
import { OrderTimeline } from './OrderTimeline'

interface ShipmentAccordionProps {
  order: OrderWithItems
  onOpenLocation?: () => void
}

function fmtDate(iso?: string): string {
  return iso ? new Date(iso).toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
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

export function ShipmentAccordion({ order }: ShipmentAccordionProps) {
  const isTrackable = shipmentService.isTrackable(order)
  const [openState, setOpenState] = useState<string | null>(() => (isTrackable ? 'shipped' : 'paid'))
  const tracking = shipmentService.trackingNumber(order)
  const status = (order.status ?? '').toLowerCase()
  const info = shipmentService.info(order)
  const events = shipmentService.events(order)

  const copyTracking = () => {
    void navigator.clipboard?.writeText(tracking).then(() => {
      toast.success('Tracking number copied')
    })
  }

  const steps = [
    {
      key: 'paid',
      title: 'Payment Completed',
      sub: 'Payment confirmed',
      detail: (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Payment method</p>
            <p className="font-medium">Bank Transfer</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid at</p>
            <p className="font-medium">{fmtDate(order.paid_at ?? order.placed_at)}</p>
          </div>
        </div>
      ),
      show: true,
    },
    {
      key: 'processing',
      title: 'Order Processing',
      sub: 'Seller preparing your order',
      detail: (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Seller</p>
            <p className="font-medium">Nadrical Store</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated</p>
            <p className="font-medium">1–2 days</p>
          </div>
        </div>
      ),
      show: true,
    },
    {
      key: 'shipped',
      title: 'Shipped',
      sub: 'Package handed to courier',
      detail: (
        <div className="space-y-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Courier</p>
              <p className="font-medium">{info.courier}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tracking number</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{tracking}</span>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Copy tracking number" onClick={copyTracking}>
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <span className="rounded-full bg-sky-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {info.statusLabel}
            </span>
          </div>

          {events.length > 0 && (
            <div className="border-t pt-4">
              <p className="mb-3 font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Shipment Journey
              </p>
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
            </div>
          )}
        </div>
      ),
      show: isTrackable,
    },
    {
      key: 'delivered',
      title: 'Delivered',
      sub: 'Arrived at destination',
      detail: (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Delivered at</p>
            <p className="font-medium">{fmtDate(order.delivered_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Received by</p>
            <p className="font-medium">{order.recipient_name || 'User'}</p>
          </div>
        </div>
      ),
      show: status === 'completed',
    },
  ]

  const activeIdx = isTrackable ? 2 : status === 'completed' ? 3 : status === 'processing' || status === 'paid' ? 1 : 0

  return (
    <div>
      <div className="mb-4">
        <OrderTimeline order={order} />
      </div>
      <div className="space-y-2">
        {steps
          .filter((s) => s.show)
          .map((step) => {
            const open = openState === step.key
            const reached = activeIdx >= steps.findIndex((x) => x.key === step.key)
            return (
              <div
                key={step.key}
                className={cn(
                  'overflow-hidden rounded-lg border-2',
                  reached ? 'border-border' : 'border-dashed border-border/60 opacity-70',
                )}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenState((prev) => (prev === step.key ? null : step.key))}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full',
                      reached ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {reached && <Truck className="size-3" />}
                  </span>
                  <span className="grow">
                    <span className="block text-sm font-semibold">{step.title}</span>
                    <span className="block text-xs text-muted-foreground">{step.sub}</span>
                  </span>
                  <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
                </button>
                {open && <div className="border-t bg-muted/30 px-4 py-3">{step.detail}</div>}
              </div>
            )
          })}
      </div>
    </div>
  )
}
