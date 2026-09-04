export type VoucherType = 'percent' | 'fixed'

export interface Voucher {
  code: string
  type: VoucherType
  value: number
  min_subtotal?: number
  max_discount?: number
  description?: string
  expires_at?: string
  active?: boolean
}

export interface AppliedVoucher {
  code: string
  discount: number
  voucher: Voucher
}
