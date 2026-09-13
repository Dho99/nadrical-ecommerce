import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Loader2, PackageCheck } from 'lucide-react'
import { toast } from '@/shared/lib/alert'
import { Button, Card, Separator } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import { orderRepository } from '../services/order.repository'
import { invoiceService } from '../../orders/services/invoice.service'
import type { OrderConfirmation } from '../types/checkout.type'

interface OrderConfirmationCardProps {
  confirmation: OrderConfirmation
  onBackToCheckout?: () => void
}

export function OrderConfirmationCard({ confirmation, onBackToCheckout }: OrderConfirmationCardProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadInvoice = async () => {
    setDownloading(true)
    try {
      const orders = await orderRepository.list()
      const found = orders.find(
        (o) => o.order_number === confirmation.order_number || o.id === confirmation.order_number,
      )
      if (found) {
        const invoiceData = invoiceService.build(found, confirmation.email)
        await invoiceService.download(invoiceData)
        toast.success('Invoice downloaded successfully')
      } else {
        toast.error('Order data not found for invoice generation')
      }
    } catch {
      toast.error('Failed to generate invoice')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-lg p-6 text-center sm:p-8">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <PackageCheck className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Order placed</h1>

      <Separator className="my-5" />

      <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">Order number</p>
      <p className="mt-1 font-display text-4xl font-bold tracking-tight">{confirmation.order_number}</p>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        A confirmation is on its way to <span className="font-semibold text-foreground">{confirmation.email}</span>.
        Your order will ship in{' '}
        <span className="font-semibold text-foreground">
          {confirmation.eta_days} day{confirmation.eta_days === 1 ? '' : 's'}
        </span>
        .
      </p>
      <p className="mt-2 font-mono text-sm">
        Total charged (demo): <span className="font-semibold">{formatPrice(confirmation.grand_total)}</span>
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="default" size="lg" disabled={downloading} onClick={handleDownloadInvoice}>
          {downloading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Generating PDF…
            </>
          ) : (
            <>
              <Download className="size-4" /> Download invoice
            </>
          )}
        </Button>
        {onBackToCheckout ? (
          <Button size="lg" variant="outline" onClick={onBackToCheckout}>
            Kembali ke checkout
          </Button>
        ) : null}
        <Link to={`/profile/orders/${encodeURIComponent(confirmation.order_number)}`}>
          <Button variant="outline" size="lg">
            Lihat pesanan
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="outline" size="lg">
            Continue shopping
          </Button>
        </Link>
      </div>
    </Card>
  )
}
