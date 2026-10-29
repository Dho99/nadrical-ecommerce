export type VoucherType = 'percent' | 'fixed' | 'percentage' | 'nominal'

export type VoucherTargetType = 'all' | 'limited' | 'loyalty'

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
  target_type?: VoucherTargetType
}

export interface AppliedVoucher {
  code: string
  discount: number
  voucher: Voucher
}

export interface CustomerVoucher {
  uuid: string
  voucher_uuid: string
  account_uuid: string
  status: 'active' | 'used' | 'expired'
  claimed_at: string
  used_at?: string | null
  voucher: Voucher
}

export interface ClaimableLoyaltyVoucher {
  voucher: Voucher
  is_claimed: boolean
  tier_name: string
}
