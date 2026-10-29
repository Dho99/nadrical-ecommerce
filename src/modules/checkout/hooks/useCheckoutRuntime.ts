import { create } from 'zustand'
import type { PaymentKind } from '../types/checkout.type'
import type { GatewayPaymentMethod, GatewayShippingMethod } from '../services/order.repository'

interface CheckoutRuntimeState {
  shippingMethod: string
  shippingMethodData: GatewayShippingMethod | null
  paymentKind: PaymentKind
  paymentProvider: string
  paymentMethod: GatewayPaymentMethod | null
  setShippingMethod: (method: GatewayShippingMethod) => void
  setPaymentMethod: (method: GatewayPaymentMethod) => void
  setPaymentKind: (kind: PaymentKind) => void
  setPaymentProvider: (provider: string) => void
  reset: () => void
}

const INITIAL_SHIPPING = 'standard'
const INITIAL_PAYMENT_KIND: PaymentKind = 'bank'

export const useCheckoutRuntime = create<CheckoutRuntimeState>((set) => ({
  shippingMethod: INITIAL_SHIPPING,
  shippingMethodData: null,
  paymentKind: INITIAL_PAYMENT_KIND,
  paymentProvider: '',
  paymentMethod: null,
  setShippingMethod: (method) =>
    set({ shippingMethod: method.uuid, shippingMethodData: method }),
  setPaymentMethod: (method) =>
    set({
      paymentMethod: method,
      paymentKind: 'bank',
      paymentProvider: method.code,
    }),
  setPaymentKind: (kind) => set({ paymentKind: kind }),
  setPaymentProvider: (provider) => set({ paymentProvider: provider }),
  reset: () =>
    set({
      shippingMethod: INITIAL_SHIPPING,
      shippingMethodData: null,
      paymentKind: INITIAL_PAYMENT_KIND,
      paymentProvider: '',
      paymentMethod: null,
    }),
}))
