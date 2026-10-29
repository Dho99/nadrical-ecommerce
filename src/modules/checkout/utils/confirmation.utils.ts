import type { OrderConfirmation } from '../types/checkout.type'

const STORAGE_KEY = 'last-order-confirmation'

interface StoredConfirmation {
  order_id?: string
  order_number: string
  placed_at: string
  email: string
  eta_days: number
  shipping_etd?: string
  shipping_method_name?: string
  payment_method_code?: string
  payment_method_name?: string
  payment_bank_name?: string
  payment_account_number?: string
  payment_account_holder?: string
  payment_instructions?: string
  grand_total: number
}

function reviveConfirmation(v: OrderConfirmation | StoredConfirmation): OrderConfirmation {
  const placed = (v as { placed_at: unknown }).placed_at
  const date = placed instanceof Date ? placed : new Date(typeof placed === 'string' ? placed : new Date().toISOString())
  return {
    order_id: typeof (v as { order_id?: unknown }).order_id === 'string'
      ? (v as { order_id: string }).order_id
      : undefined,
    order_number: v.order_number,
    email: v.email,
    eta_days: v.eta_days,
    shipping_etd: typeof (v as { shipping_etd?: unknown }).shipping_etd === 'string'
      ? (v as { shipping_etd: string }).shipping_etd
      : undefined,
    shipping_method_name: typeof (v as { shipping_method_name?: unknown }).shipping_method_name === 'string'
      ? (v as { shipping_method_name: string }).shipping_method_name
      : undefined,
    payment_method_code: typeof (v as { payment_method_code?: unknown }).payment_method_code === 'string'
      ? (v as { payment_method_code: string }).payment_method_code
      : undefined,
    payment_method_name: typeof (v as { payment_method_name?: unknown }).payment_method_name === 'string'
      ? (v as { payment_method_name: string }).payment_method_name
      : undefined,
    payment_bank_name: typeof (v as { payment_bank_name?: unknown }).payment_bank_name === 'string'
      ? (v as { payment_bank_name: string }).payment_bank_name
      : undefined,
    payment_account_number: typeof (v as { payment_account_number?: unknown }).payment_account_number === 'string'
      ? (v as { payment_account_number: string }).payment_account_number
      : undefined,
    payment_account_holder: typeof (v as { payment_account_holder?: unknown }).payment_account_holder === 'string'
      ? (v as { payment_account_holder: string }).payment_account_holder
      : undefined,
    payment_instructions: typeof (v as { payment_instructions?: unknown }).payment_instructions === 'string'
      ? (v as { payment_instructions: string }).payment_instructions
      : undefined,
    grand_total: v.grand_total,
    placed_at: date,
  }
}

function isStoredConfirmation(v: unknown): v is StoredConfirmation {
  if (v === null || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.order_number === 'string' &&
    typeof o.placed_at === 'string' &&
    typeof o.email === 'string' &&
    typeof o.eta_days === 'number' &&
    typeof o.grand_total === 'number'
  )
}

function isOrderConfirmationState(v: unknown): v is OrderConfirmation {
  if (v === null || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  const validDate = o.placed_at instanceof Date || typeof o.placed_at === 'string'
  return (
    typeof o.order_number === 'string' &&
    validDate &&
    typeof o.email === 'string' &&
    typeof o.eta_days === 'number' &&
    typeof o.grand_total === 'number'
  )
}

/**
 * Membaca OrderConfirmation dari location.state atau sessionStorage
 * `last-order-confirmation` (key sama dipakai OrderConfirmationPage & CheckoutSuccessPage).
 */
export function readOrderConfirmation(locationState: unknown): OrderConfirmation | null {
  if (isOrderConfirmationState(locationState)) {
    return reviveConfirmation(locationState as OrderConfirmation | StoredConfirmation)
  }
  if (locationState !== null && typeof locationState === 'object') {
    const maybeWrapped = (locationState as Record<string, unknown>).confirmation as unknown
    if (isOrderConfirmationState(maybeWrapped)) return reviveConfirmation(maybeWrapped as OrderConfirmation | StoredConfirmation)
    if (isStoredConfirmation(maybeWrapped)) return reviveConfirmation(maybeWrapped)
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isStoredConfirmation(parsed)) return reviveConfirmation(parsed)
      if (isOrderConfirmationState(parsed)) return reviveConfirmation(parsed as OrderConfirmation | StoredConfirmation)
    }
  } catch {
    // ignore
  }
  return null
}
