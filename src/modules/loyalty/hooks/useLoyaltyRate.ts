import { useEffect, useState } from 'react'
import { siteSettingsService } from '../../settings/services/site-settings.service'

const DEFAULT_RUPIAH_PER_POINT = 10_000

export function useLoyaltyRate() {
  const [rupiahPerPoint, setRupiahPerPoint] = useState(DEFAULT_RUPIAH_PER_POINT)

  useEffect(() => {
    let cancelled = false
    siteSettingsService
      .getSetting('loyalty_rupiah_per_point')
      .then((setting) => {
        if (cancelled || !setting?.value) return
        const digits = setting.value.replace(/<[^>]*>/g, '').replace(/[^\d.]/g, '')
        const parsed = Number(digits)
        if (Number.isFinite(parsed) && parsed >= 100) setRupiahPerPoint(parsed)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return rupiahPerPoint
}
