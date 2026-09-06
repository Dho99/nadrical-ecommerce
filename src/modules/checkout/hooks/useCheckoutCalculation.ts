import { useMemo } from 'react'
import { useVoucher } from '../../voucher/hooks/useVoucher'
import { paymentService } from '../services/payment.service'
import { shippingService } from '../services/shipping.service'
import type { CartItem } from '../../cart/types/cart.type'
import type { PaymentKind, ShippingMethod } from '../types/checkout.type'
import { useCheckoutRuntime } from './useCheckoutRuntime'

interface UseCheckoutCalculationParams {
  items: CartItem[]
}

export interface CheckoutCalculation {
  subtotal: number
  shippingTotal: number
  paymentFee: number
  voucherDiscount: number
  grandTotal: number
  freeShipping: boolean
  shippingMethod: ShippingMethod
  paymentKind: PaymentKind
}

export function useCheckoutCalculation({ items }: UseCheckoutCalculationParams) {
  const shippingMethod = useCheckoutRuntime((s) => s.shippingMethod)
  const paymentKind = useCheckoutRuntime((s) => s.paymentKind)
  const { applied, discount } = useVoucher()

  return useMemo<CheckoutCalculation>(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    )
    const quote = shippingService.quote(shippingMethod, subtotal)
    const voucherDiscount = applied ? discount(subtotal, quote.cost) : 0
    const paymentFee = paymentService.fee(paymentKind, subtotal)
    const grandTotal = Math.max(
      0,
      subtotal - voucherDiscount + quote.cost + paymentFee,
    )
    return {
      subtotal,
      shippingTotal: quote.cost,
      paymentFee,
      voucherDiscount,
      grandTotal,
      freeShipping: quote.free,
      shippingMethod,
      paymentKind,
    }
  }, [items, shippingMethod, paymentKind, applied, discount])
}
