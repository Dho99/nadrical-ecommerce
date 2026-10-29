import { formatPrice } from '../../../shared/utils/format'
import type { Voucher } from '../types/voucher.type'

export function voucherValueLabel(voucher: Voucher): string {
  const isPercent = voucher.type === 'percent' || voucher.voucher_type === 'percentage'
  const value = voucher.discount_value ?? voucher.value
  return isPercent ? `${value}% OFF` : `Potongan ${formatPrice(value)}`
}

export function isVoucherUsable(voucher: Voucher): boolean {
  if (voucher.active === false || voucher.is_active === false) return false
  if (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) return false
  if (voucher.valid_to_date && new Date(voucher.valid_to_date).getTime() < Date.now()) return false
  return true
}
