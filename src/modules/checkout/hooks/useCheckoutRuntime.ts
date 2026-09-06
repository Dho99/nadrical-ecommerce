import { create } from 'zustand'
import type { PaymentKind } from '../types/checkout.type'
import type { ShippingMethod } from '../types/checkout.type'

interface CheckoutRuntimeState {
  shippingMethod: ShippingMethod
  paymentKind: PaymentKind
  paymentProvider: string
  setShippingMethod: (method: ShippingMethod) => void
  setPaymentKind: (kind: PaymentKind) => void
  setPaymentProvider: (provider: string) => void
  reset: () => void
}

export const useCheckoutRuntime = create<CheckoutRuntimeState>((set) => ({
  shippingMethod: 'standard',
  paymentKind: 'card',
  paymentProvider: 'visa',
  setShippingMethod: (method) => set({ shippingMethod: method }),
  setPaymentKind: (kind) => set({ paymentKind: kind }),
  setPaymentProvider: (provider) => set({ paymentProvider: provider }),
  reset: () =>
    set({ shippingMethod: 'standard', paymentKind: 'card', paymentProvider: 'visa' }),
}))
