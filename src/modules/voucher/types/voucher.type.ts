export type VoucherType = 'percent' | 'fixed' | 'percentage' | 'nominal'

export interface Voucher {
  code: string
  type: 'percent' | 'fixed'
  value: number
  min_subtotal?: number
  max_discount?: number
  description?: string
  expires_at?: string
  active?: boolean
  uuid?: string
  voucher_type?: string
  discount_value?: number
  max_discount_amount?: number | null
  min_purchase_amount?: number | null
  valid_from_date?: string
  valid_to_date?: string
  is_active?: boolean
}

export interface AppliedVoucher {
  code: string
  discount: number
  voucher: Voucher
}
