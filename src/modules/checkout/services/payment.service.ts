import type { PaymentKind } from '../types/checkout.type'

export interface PaymentOption {
  id: string
  label: string
}

export interface PaymentGroup {
  kind: PaymentKind
  label: string
  feeRate: number
  options: PaymentOption[]
}

export const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    kind: 'bank',
    label: 'M-Banking',
    feeRate: 0,
    options: [
      { id: 'bca', label: 'BCA' },
      { id: 'mandiri', label: 'Mandiri' },
      { id: 'bni', label: 'BNI' },
      { id: 'bri', label: 'BRI' },
    ],
  },
  {
    kind: 'e-money',
    label: 'E-Money',
    feeRate: 0.02,
    options: [
      { id: 'gopay', label: 'GoPay' },
      { id: 'ovo', label: 'OVO' },
      { id: 'dana', label: 'Dana' },
      { id: 'shopeepay', label: 'ShopeePay' },
    ],
  },
  {
    kind: 'card',
    label: 'Credit / Debit Card',
    feeRate: 0,
    options: [
      { id: 'visa', label: 'Visa' },
      { id: 'mastercard', label: 'Mastercard' },
    ],
  },
]

export const paymentService = {
  getGroups() {
    return PAYMENT_GROUPS
  },

  getGroup(kind: PaymentKind) {
    return PAYMENT_GROUPS.find((g) => g.kind === kind) ?? PAYMENT_GROUPS[2]
  },

  fee(kind: PaymentKind, subtotal: number): number {
    const rate = this.getGroup(kind).feeRate
    return rate > 0 ? subtotal * rate : 0
  },
}
