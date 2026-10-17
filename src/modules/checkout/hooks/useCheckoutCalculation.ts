import { useMemo } from 'react'
import { useVoucher } from '../../voucher/hooks/useVoucher'
import { useActiveTaxes } from '../../tax'
import { paymentService } from '../services/payment.service'
import { shippingService } from '../services/shipping.service'
import type { CartItem } from '../../cart/types/cart.type'
import type { PaymentKind, ShippingMethod } from '../types/checkout.type'
import { useCheckoutRuntime } from './useCheckoutRuntime'

interface UseCheckoutCalculationParams {
  items: CartItem[]
}

export interface ActiveTaxLine {
  uuid: string
  name: string
  rate: number
  amount: number
}

export interface CheckoutCalculation {
  subtotal: number
  shippingTotal: number
  paymentFee: number
  voucherDiscount: number
  taxTotal: number
  taxes: ActiveTaxLine[]
  grandTotal: number
  freeShipping: boolean
  shippingMethod: ShippingMethod
  paymentKind: PaymentKind
  taxesLoading: boolean
}

export function useCheckoutCalculation({ items }: UseCheckoutCalculationParams) {
  const shippingMethod = useCheckoutRuntime((s) => s.shippingMethod)
  const paymentKind = useCheckoutRuntime((s) => s.paymentKind)
  const { applied, discount } = useVoucher()
  const { taxes: activeTaxes, loading: taxesLoading } = useActiveTaxes()

  return useMemo<CheckoutCalculation>(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
      0,
    )
    const quote = shippingService.quote(shippingMethod, subtotal)
    const rawDiscount = applied ? discount(subtotal, quote.cost) : 0
    const voucherDiscount = Math.max(0, Number(rawDiscount) || 0)
    const paymentFee = Math.max(0, Number(paymentService.fee(paymentKind, subtotal)) || 0)

    const taxableBase = Math.max(0, subtotal - voucherDiscount)
    const taxes: ActiveTaxLine[] = activeTaxes.map((t) => {
      const effectiveRate = t.rate > 1 ? t.rate / 100 : t.rate
      const amount = Math.round(taxableBase * effectiveRate)
      return {
        uuid: t.uuid,
        name: t.name,
        rate: effectiveRate,
        amount,
      }
    })
    const taxTotal = taxes.reduce((sum, t) => sum + t.amount, 0)

    const grandTotal = Math.max(
      0,
      subtotal - voucherDiscount + taxTotal + quote.cost + paymentFee,
    )
    return {
      subtotal,
      shippingTotal: quote.cost,
      paymentFee,
      voucherDiscount,
      taxTotal,
      taxes,
      grandTotal,
      freeShipping: quote.free,
      shippingMethod,
      paymentKind,
      taxesLoading,
    }
  }, [items, shippingMethod, paymentKind, applied, discount, activeTaxes, taxesLoading])
}
