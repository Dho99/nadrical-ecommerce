import { POSTAL_API_BASE } from '../constants/postal.constants'

export interface PostalPlace {
  postal_code: string
  city: string
  province: string
  district: string
  village: string
}

interface KodeposResponse {
  statusCode: number
  code: string
  data: Array<{
    code: number
    province: string
    regency: string
    district: string
    village: string
  }>
}

export const postalService = {
  async lookup(postalCode: string): Promise<PostalPlace[]> {
    const code = postalCode.trim()
    if (!code) return []
    try {
      const res = await fetch(`${POSTAL_API_BASE}/?q=${encodeURIComponent(code)}`)
      if (!res.ok) return []
      const data = (await res.json()) as KodeposResponse
      if (!Array.isArray(data.data)) return []
      return data.data.map((place) => ({
        postal_code: String(place.code),
        city: place.regency,
        province: place.province,
        district: place.district,
        village: place.village,
      }))
    } catch {
      return []
    }
  },
}
