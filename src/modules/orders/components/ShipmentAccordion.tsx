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
  onOpenLocation: () => void
}

function fmtDate(iso?: string): string {
  return iso ? new Date(iso).toLocaleDateString('en-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

export function ShipmentAccordion({ order, onOpenLocation }: ShipmentAccordionProps) {
  const [openState, setOpenState] = useState<string | null>('paid')
  const tracking = shipmentService.trackingNumber(order)
  const status = (order.status ?? '').toLowerCase()

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
        <div className="space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Courier</p>
              <p className="font-medium">{shipmentService.info(order).courier}</p>
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
          {shipmentService.isTrackable(order) && (
            <Button type="button" variant="outline" size="sm" onClick={onOpenLocation}>
              <MapPin className="size-3.5" /> View shipment location
            </Button>
          )}
        </div>
      ),
      show: shipmentService.isTrackable(order),
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

  const activeIdx = shipmentService.isTrackable(order) ? 2 : status === 'completed' ? 3 : status === 'processing' || status === 'paid' ? 1 : 0

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
