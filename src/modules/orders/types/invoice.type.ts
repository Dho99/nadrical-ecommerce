import type { CurrencyCode } from '../../currency/types/currency.type'

export interface InvoiceItemData {
  productName: string
  variant?: string
  quantity: number
  unitPrice: number
  discount?: number
  total: number
}

export interface InvoiceCustomerData {
  name: string
  phone?: string
  email?: string
  addressLines: string[]
}

export interface InvoiceShippingData {
  courier: string
  tracking?: string
  cost: number
}

export interface InvoicePaymentData {
  method: string
  status: string
}

export interface InvoiceSummaryData {
  subtotal: number
  shipping: number
  discount: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  orderId: string
  orderNumber: string
  issuedAt: Date
  currency: CurrencyCode
  customer: InvoiceCustomerData
  items: InvoiceItemData[]
  shipping: InvoiceShippingData
  payment: InvoicePaymentData
  summary: InvoiceSummaryData
}
