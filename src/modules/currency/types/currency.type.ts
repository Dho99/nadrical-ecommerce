export type CurrencyCode = 'USD' | 'IDR'

export interface CurrencyConfig {
  code: CurrencyCode
  locale: string
  symbol: string
  rate: number
}
