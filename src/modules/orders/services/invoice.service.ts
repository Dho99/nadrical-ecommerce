import { jsPDF } from 'jspdf'
import { useCurrencyStore } from '../../currency/hooks/useCurrency'
import { CURRENCIES } from '../../currency/constants/currency.constants'
import { shipmentService } from './shipment.service'
import type { OrderWithItems } from '../types/order.type'
import type { CurrencyCode } from '../../currency/types/currency.type'
import type { InvoiceData } from '../types/invoice.type'

const ACCENT: [number, number, number] = [0x39, 0x25, 0x8d]
const GREY: [number, number, number] = [0x9c, 0xa3, 0xaf]
const MUTED: [number, number, number] = [0x6b, 0x72, 0x80]

let logoCache: string | null | undefined

function logoDataUrl(): Promise<string | null> {
  if (logoCache !== undefined) return Promise.resolve(logoCache)
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 206
        canvas.height = 52
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          logoCache = null
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0, 206, 52)
        logoCache = canvas.toDataURL('image/png')
        resolve(logoCache)
      } catch {
        logoCache = null
        resolve(null)
      }
    }
    img.onerror = () => {
      logoCache = null
      resolve(null)
    }
    img.src = '/logo.svg'
  })
}

function money(code: CurrencyCode, value: number): string {
  const rounded = code === 'IDR' ? Math.round(value) : Math.round(value * 100) / 100
  return code === 'IDR'
    ? `Rp${rounded.toLocaleString('id-ID')}`
    : `$${rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtLongDate(d: Date): string {
  return d.toLocaleDateString('en-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function statusColor(status: string): [number, number, number] {
  const s = status.toLowerCase()
  if (s === 'paid' || s === 'completed' || s === 'delivering') return [16, 185, 129]
  if (s === 'processing') return [37, 99, 235]
  if (s === 'shipped') return [124, 58, 237]
  if (s === 'cancelled' || s === 'refunded') return [220, 38, 38]
  return [100, 116, 139]
}

function convertBase(value: number, code: CurrencyCode): number {
  return value * CURRENCIES[code].rate
}

function build(order: OrderWithItems, email?: string): InvoiceData {
  const code = useCurrencyStore.getState().code
  const norm = (order.status ?? '').toLowerCase()
  const subtotal = convertBase(Number(order.subtotal ?? 0), code)
  const shipping = convertBase(Number(order.shipping_total ?? 0), code)
  const discount = convertBase(Number(order.discount_total ?? 0), code)

  const addressLines = [
    order.shipping_address_line_1,
    [order.shipping_city, order.shipping_province].filter(Boolean).join(', '),
  ].filter(Boolean) as string[]

  return {
    invoiceNumber: `INV-${order.order_number}`,
    orderId: order.id,
    orderNumber: order.order_number,
    issuedAt: new Date(),
    currency: code,
    customer: {
      name: order.recipient_name || 'Demo User',
      phone: order.recipient_phone,
      email,
      addressLines,
    },
    items: order.order_items.map((item) => ({
      productName: item.product_name_snapshot,
      variant: item.variant_name_snapshot,
      quantity: item.quantity,
      unitPrice: convertBase(item.unit_price, code),
      total: convertBase(item.unit_price * item.quantity, code),
    })),
    shipping: {
      courier: shipmentService.courierLabel(order.shipping_method),
      tracking: shipmentService.isTrackable(order) ? shipmentService.trackingNumber(order) : undefined,
      cost: shipping,
    },
    payment: {
      method: 'Bank Transfer',
      status: ['paid', 'processing', 'shipped', 'completed', 'delivering'].includes(norm)
        ? 'PAID'
        : (order.status ?? '').toUpperCase(),
    },
    summary: {
      subtotal,
      shipping,
      discount,
      total: convertBase(Number(order.grand_total ?? order.subtotal ?? 0), code),
    },
  }
}

async function renderAndSave(invoice: InvoiceData): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 48
  const R = W - M
  const m = money.bind(null, invoice.currency)
  let y = 0

  const sectionTitle = (title: string, top: number) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2])
    doc.text(title.toUpperCase(), M, top)
    doc.setDrawColor(...GREY)
    doc.setLineWidth(0.75)
    doc.line(M, top + 6, R, top + 6)
    return top + 22
  }

  const labelValue = (label: string, value: string, x: number, yy: number, align: 'left' | 'right' = 'left') => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(label, x, yy, { align })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(value, x, yy + 13, { align })
  }

  // Accent top bar
  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, W, 4, 'F')

  // Header
  const logo = await logoDataUrl()
  if (logo) {
    doc.addImage(logo, 'PNG', M, 26, 92, 23.2)
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...ACCENT)
    doc.text('NADRICAL', M, 44)
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Modern Lifestyle Store', M, logo ? 62 : 54)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text('INVOICE', R, 40, { align: 'right' })
  labelValue('Invoice No', invoice.invoiceNumber, R, 52, 'right')
  labelValue('Issued', fmtLongDate(invoice.issuedAt), R, 78, 'right')

  y = 104
  doc.setDrawColor(...GREY)
  doc.setLineWidth(0.75)
  doc.line(M, y, R, y)
  y += 34

  const midX = 330
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('CUSTOMER INFORMATION', M, y)
  doc.text('ORDER INFORMATION', midX, y)
  y += 22

  const contentTop = y
  let ly = contentTop
  let ry = contentTop

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(invoice.customer.name, M, ly)
  doc.setFont('helvetica', 'normal')
  ly += 14
  const leftLines: string[] = []
  if (invoice.customer.phone) leftLines.push(invoice.customer.phone)
  if (invoice.customer.email) leftLines.push(invoice.customer.email)
  leftLines.push(...invoice.customer.addressLines)
  for (const line of leftLines) {
    doc.text(line, M, ly)
    ly += 13
  }

  const orderRows: Array<[string, string]> = [
    ['Order ID', invoice.orderNumber],
    ['Payment', invoice.payment.status],
    ['Currency', invoice.currency],
  ]
  orderRows.forEach(([label, value]) => {
    labelValue(label, value, midX, ry)
    ry += 28
  })

  y = Math.max(ly, ry) + 12

  // Items table
  y = sectionTitle('Item Summary', y)
  const cols = [
    { x: M, align: 'left' as const, label: 'Product' },
    { x: 340, align: 'left' as const, label: 'Qty' },
    { x: 420, align: 'right' as const, label: 'Unit Price' },
    { x: R, align: 'right' as const, label: 'Total' },
  ]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  cols.forEach((c) => doc.text(c.label, c.x, y, { align: c.align }))
  y += 14
  doc.setDrawColor(...GREY)
  doc.setLineWidth(0.5)
  doc.line(M, y, R, y)
  y += 16

  invoice.items.forEach((item) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text(item.productName.slice(0, 46), M, y)
    doc.text(String(item.quantity), cols[1].x, y, { align: cols[1].align })
    doc.text(m(item.unitPrice), cols[2].x, y, { align: cols[2].align })
    doc.setFont('helvetica', 'bold')
    doc.text(m(item.total), cols[3].x, y, { align: cols[3].align })
    if (item.variant) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text(`Variant: ${item.variant.slice(0, 40)}`, M, y + 11)
      y += 12
    }
    y += 18
  })

  doc.setDrawColor(0x9c, 0xa3, 0xaf)
  doc.setLineWidth(0.5)
  doc.line(M, y, R, y)
  y += 24

  // Summary right
  const sumX = 360
  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(label, sumX, y, { align: 'left' })
    doc.setTextColor(0, 0, 0)
    doc.text(value, R, y, { align: 'right' })
    y += 15
  }
  row('Subtotal', m(invoice.summary.subtotal))
  row('Shipping', m(invoice.summary.shipping))
  row('Discount', invoice.summary.discount > 0 ? `-${m(invoice.summary.discount)}` : money(invoice.currency, 0))
  doc.setDrawColor(0x9c, 0xa3, 0xaf)
  doc.line(sumX, y + 2, R, y + 2)
  y += 16
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL', sumX, y)
  doc.text(m(invoice.summary.total), R, y, { align: 'right' })
  y += 20

  // Payment info
  y = Math.max(y + 8, 470)
  y = sectionTitle('Payment Information', y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Status', M, y)
  const sw = doc.getTextWidth(invoice.payment.status) + 22
  const sy = y + 2
  doc.setFillColor(...statusColor(invoice.payment.status))
  doc.roundedRect(M, sy, sw, 16, 5, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(invoice.payment.status, M + 11, sy + 11)
  labelValue('Payment Method', invoice.payment.method, midX, y)
  y += 44

  // Shipping info
  y = sectionTitle('Shipping Information', y)
  labelValue('Courier', invoice.shipping.courier, M, y)
  labelValue('Tracking Number', invoice.shipping.tracking ?? '—', midX, y)
  y += 30
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Address', M, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  y += 13
  const addr = invoice.customer.addressLines.length > 0 ? invoice.customer.addressLines : ['—']
  addr.forEach((line) => {
    doc.text(line, M, y)
    y += 13
  })

  y = Math.max(y + 18, 660)

  // Footer
  doc.setDrawColor(0x9c, 0xa3, 0xaf)
  doc.setLineWidth(0.75)
  doc.line(M, y, R, y)
  y += 22
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...ACCENT)
  doc.text('Thank you for shopping with NADRICAL.', M, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('This invoice was generated automatically. For support, please contact:', M, y)
  doc.text('support@nadrical.com', M, y + 12)
  doc.text('© 2026 NADRICAL', M, y + 26)

  doc.save(`${invoice.invoiceNumber}.pdf`)
}

export const invoiceService = {
  build,
  download: renderAndSave,
}
