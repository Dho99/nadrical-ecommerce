import { Check } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { STATUS_STEPS, statusStepIndex } from '../../../shared/utils/order-status'
import type { OrderWithItems } from '../types/order.type'

const DESC: Record<(typeof STATUS_STEPS)[number], string> = {
  payment_pending: 'Order placed',
  paid: 'Payment confirmed',
  processing: 'Seller preparing your order',
  shipped: 'Package handed to courier',
  completed: 'Order completed',
}

const STEP_DATE_INDEX: Record<(typeof STATUS_STEPS)[number], 'placed_at' | 'paid_at' | 'shipped_at' | 'delivered_at' | undefined> = {
  payment_pending: 'placed_at',
  paid: 'paid_at',
  processing: undefined,
  shipped: 'shipped_at',
  completed: 'delivered_at',
}

function fmt(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderTimeline({ order }: { order: OrderWithItems }) {
  const active = statusStepIndex(order.status)

  return (
    <ol className="space-y-0" aria-label="Order journey">
      {STATUS_STEPS.map((step, i) => {
        const done = i < active
        const current = i === active
        const reached = done || current
        const dateKey = STEP_DATE_INDEX[step]
        const date = dateKey ? order[dateKey] : undefined
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                  reached
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                {reached ? <Check className="size-4" /> : i + 1}
              </span>
              {i < STATUS_STEPS.length - 1 && (
                <span className={cn('w-0.5 flex-1', done ? 'bg-emerald-600' : 'bg-border')} />
              )}
            </div>
            <div className={cn('pb-6', !reached && 'opacity-60')}>
              <p className="text-sm font-semibold capitalize">{step.replace('_', ' ')}</p>
              <p className="text-xs text-muted-foreground">{DESC[step]}</p>
              {date && <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{fmt(date)}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
