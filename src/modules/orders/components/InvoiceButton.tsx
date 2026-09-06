import { Download } from 'lucide-react'
import { Button } from '../../../shared/components/ui'
import { invoiceService } from '../services/invoice.service'
import type { OrderWithItems } from '../types/order.type'

interface InvoiceButtonProps {
  order: OrderWithItems
  email?: string
  label?: string
  variant?: 'outline' | 'default'
}

export function InvoiceButton({
  order,
  email,
  label = 'Download invoice',
  variant = 'outline',
}: InvoiceButtonProps) {
  const download = () => {
    const data = invoiceService.build(order, email)
    void invoiceService.download(data)
  }

  return (
    <Button type="button" variant={variant} size="sm" onClick={download}>
      <Download className="size-3.5" /> {label}
    </Button>
  )
}
