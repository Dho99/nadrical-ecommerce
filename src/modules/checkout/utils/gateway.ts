import type { GatewayPaymentMethod, GatewayShippingMethod } from '../services/order.repository'

export function isManualPaymentMethod(method: GatewayPaymentMethod): boolean {
  return method.gateway_code === 'manual' || method.category === 'BANK_TRANSFER'
}

export function gatewayPaymentFee(method: GatewayPaymentMethod | null | undefined, subtotal: number): number {
  if (!method) return 0
  const base = Math.max(0, Number(method.additional_fee) || 0)
  const feeType = String(method.fee_type || 'FIXED').toUpperCase()
  if (feeType === 'PERCENTAGE') {
    return Math.max(0, (Math.max(0, subtotal) * base) / 100)
  }
  return base
}

export function gatewayShippingCost(method: GatewayShippingMethod | null | undefined): number {
  if (!method) return 0
  const base = Math.max(0, Number(method.base_rate) || 0)
  const extra = Math.max(0, Number(method.additional_fee) || 0)
  const feeType = String(method.fee_type || 'FIXED').toUpperCase()
  return feeType === 'PERCENTAGE' ? base + (base * extra) / 100 : base + extra
}

export function etaDaysFromEtd(etd?: string | null): number {
  if (!etd) return 4
  const numbers = etd.match(/\d+/g)?.map((n) => Number(n)).filter((n) => Number.isFinite(n)) ?? []
  if (numbers.length === 0) return 4
  return Math.max(1, numbers[numbers.length - 1])
}

export function etaLabelFromEtd(etd?: string | null, days?: number): string {
  if (etd?.trim()) return etd.trim()
  const value = Math.max(1, days ?? 4)
  return `${value} hari`
}

export function shippingCourierLabel(method: GatewayShippingMethod | null | undefined): string {
  if (!method) return 'Kurir'
  return method.full_name || method.courier_name || method.service_name || 'Kurir'
}
