import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrencyCode } from '../types/currency.type'
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/currency.constants'

interface CurrencyStore {
  code: CurrencyCode
  set: (code: CurrencyCode) => void
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      code: DEFAULT_CURRENCY,
      set: (code) => set({ code }),
    }),
    { name: 'store-currency' },
  ),
)

export function useCurrency() {
  const code = useCurrencyStore((s) => s.code)
  const set = useCurrencyStore((s) => s.set)
  const config = CURRENCIES[code]

  const format = (usdValue: number): string => {
    const converted = usdValue * config.rate
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.code === 'IDR' ? 0 : 2,
      maximumFractionDigits: config.code === 'IDR' ? 0 : 2,
    }).format(converted)
  }

  return { code, config, set, format }
}
