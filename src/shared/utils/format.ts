import { useCurrencyStore } from '../../modules/currency/hooks/useCurrency'
import { CURRENCIES } from '../../modules/currency/constants/currency.constants'

export function formatPrice(value: number): string {
  const code = useCurrencyStore.getState().code
  const config = CURRENCIES[code]
  const converted = value * config.rate
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.code === 'IDR' ? 0 : 2,
    maximumFractionDigits: config.code === 'IDR' ? 0 : 2,
  }).format(converted)
}

export function formatQty(value: number): string {
  return value.toLocaleString('en-US')
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}
