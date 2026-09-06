import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Camera, ChevronLeft, Film, PackageOpen } from 'lucide-react'
import { profileService } from '../../modules/profile'
import { useAuth } from '../../modules/auth'
import { refundService } from '../../modules/orders/services/refund.service'
import { RefundRequestForm } from '../../modules/orders/components/RefundRequestForm'
import type { RefundRecord } from '../../modules/orders/types/refund.type'
import type { OrderWithItems } from '../../modules/orders/types/order.type'
import { Button, Card, EmptyState, Skeleton } from '../../shared/components/ui'

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StatusView({ order, record }: { order: OrderWithItems; record: RefundRecord }) {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Order</p>
            <h2 className="font-display text-2xl font-bold tracking-tight">{order.order_number}</h2>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 font-mono text-xs font-bold text-primary-foreground uppercase">
            {record.status}
          </span>
        </div>

        <ol className="mt-6 space-y-0" aria-label="Refund timeline">
          {record.timeline.map((evt, i) => {
            const last = i === record.timeline.length - 1
            return (
              <li key={`${evt.status}-${i}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="size-3 rounded-full bg-primary" />
                  {!last && <span className="h-8 w-0.5 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold">{evt.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">{fmtDate(evt.at)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold tracking-tight">Refund details</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="font-mono text-[11px] text-muted-foreground uppercase">Reason</dt>
            <dd className="font-medium">{record.reason}</dd>
          </div>
          {record.note && (
            <div>
              <dt className="font-mono text-[11px] text-muted-foreground uppercase">Note</dt>
              <dd>{record.note}</dd>
            </div>
          )}
        </dl>

        {record.proofs && record.proofs.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-[11px] text-muted-foreground uppercase">Proof attachments</p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {record.proofs.map((proof) => (
                <li key={proof.id} className="overflow-hidden rounded-lg border bg-muted">
                  {proof.kind === 'image' ? (
                    <img src={proof.preview} alt={proof.name} className="aspect-video w-full object-cover" />
                  ) : (
                    <video src={proof.preview} muted className="aspect-video w-full object-cover" />
                  )}
                  <p className="flex items-center gap-1 truncate bg-background/90 px-2 py-1 text-[11px]">
                    {proof.kind === 'image' ? <Camera className="size-3" /> : <Film className="size-3" />}
                    {proof.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}

export function RefundPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const email = user?.email ?? null
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [record, setRecord] = useState<RefundRecord | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const load = useCallback(async () => {
    if (!email || !id) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const all = await profileService.getOrderHistory(email)
      const found = all.find((o) => o.order_number === id || o.id === id) ?? null
      setOrder(found)
      setRecord(found ? refundService.getByOrderId(found.id) : null)
      setStatus(found ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }, [email, id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    void load()
  }, [load])

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (status === 'error' || !order) {
    return (
      <EmptyState
        icon={<PackageOpen className="size-10" />}
        title="Order not found"
        description="We couldn't find this order on your account."
        action={
          <Button variant="outline" asChild>
            <Link to="/profile/orders">Back to orders</Link>
          </Button>
        }
      />
    )
  }

  const norm = (order.status ?? '').toLowerCase()
  const eligible = norm === 'completed' || norm === 'delivering'

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`/profile/orders/${order.order_number}`}
          className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> Order {order.order_number}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          {record ? 'Refund status' : 'Request refund'}
        </h1>
      </div>

      {record ? (
        <StatusView order={order} record={record} />
      ) : !eligible ? (
        <EmptyState
          icon={<PackageOpen className="size-10" />}
          title="Not eligible for refund"
          description="Refunds are available once an order has been delivered or completed."
          action={
            <Button variant="outline" asChild>
              <Link to={`/profile/orders/${order.order_number}`}>Back to order</Link>
            </Button>
          }
        />
      ) : (
        <RefundRequestForm
          order={order}
          onSubmitted={(r) => {
            setRecord(r)
          }}
        />
      )}
    </div>
  )
}
