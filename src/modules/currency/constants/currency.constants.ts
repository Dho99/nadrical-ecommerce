import type { CurrencyCode, CurrencyConfig } from '../types/currency.type'

export const DEFAULT_CURRENCY: CurrencyCode = 'USD'

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', locale: 'en-US', symbol: '$', rate: 1 },
  IDR: { code: 'IDR', locale: 'id-ID', symbol: 'Rp', rate: 15_800 },
}
