import { useCurrencyStore } from '../../modules/currency/hooks/useCurrency'
import { CURRENCIES } from '../../modules/currency/constants/currency.constants'

export function formatPrice(value: number): string {
  const safeValue = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0
  const code = useCurrencyStore.getState().code
  const config = CURRENCIES[code]
  const isAlreadyIdr = Math.abs(safeValue) >= 5000
  const converted =
    code === 'IDR'
      ? (isAlreadyIdr ? safeValue : safeValue * config.rate)
      : (isAlreadyIdr ? safeValue / 15800 : safeValue)
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
