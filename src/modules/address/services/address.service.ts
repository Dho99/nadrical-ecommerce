import api from '../../../shared/lib/api'
import type { DbUserAddress } from '../../../shared/types/database.type'
import type { AddressInput, UserAddress } from '../types/address.type'

const STORAGE_KEY = 'db-user-addresses'

interface BackendAddress {
  uuid?: string
  id?: string
  account_uuid?: string
  user_id?: string
  label?: string
  recipient_name: string
  recipient_phone: string
  address_line_1: string
  address_line_2?: string
  district?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  is_primary?: boolean
  created_at?: string
  updated_at?: string
}

function mapBackendAddress(ba: BackendAddress): UserAddress {
  return {
    id: ba.uuid || ba.id || '',
    user_id: ba.account_uuid || ba.user_id || '',
    label: ba.label || undefined,
    recipient_name: ba.recipient_name,
    recipient_phone: ba.recipient_phone,
    address_line_1: ba.address_line_1,
    address_line_2: ba.address_line_2 || undefined,
    district: ba.district || undefined,
    city: ba.city || undefined,
    province: ba.province || undefined,
    postal_code: ba.postal_code || undefined,
    country_code: ba.country_code || undefined,
    is_primary: Boolean(ba.is_primary),
    created_at: ba.created_at,
    updated_at: ba.updated_at,
  }
}

function loadAll(): UserAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as UserAddress[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through
  }
  return []
}

function saveAll(addresses: UserAddress[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses))
}

export const addressService = {
  async fetchAddresses(): Promise<UserAddress[]> {
    try {
      const res = await api.get<{ success: boolean; data: BackendAddress[] }>('/core/addresses')
      if (Array.isArray(res.data?.data)) {
        const mapped = res.data.data.map(mapBackendAddress)
        saveAll(mapped)
        return mapped
      }
    } catch {
      // fallback
    }
    return loadAll()
  },

  listByEmail(email: string): UserAddress[] {
    return loadAll()
      .filter((a) => (a.user_id || '').toLowerCase() === email.trim().toLowerCase() || a.user_id === '')
      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
  },

  async add(email: string, input: AddressInput): Promise<UserAddress> {
    const user_id = email.trim().toLowerCase()
    try {
      const res = await api.post<{ success: boolean; data: BackendAddress }>('/core/addresses', {
        label: input.label,
        recipient_name: input.recipient_name,
        recipient_phone: input.recipient_phone,
        address_line_1: input.address_line_1,
        address_line_2: input.address_line_2,
        district: input.district,
        city: input.city,
        province: input.province,
        postal_code: input.postal_code,
        country_code: input.country_code,
        is_primary: input.is_primary ?? false,
      })
      if (res.data?.data) {
        const record = mapBackendAddress(res.data.data)
        const all = [...loadAll().filter((a) => a.id !== record.id), record]
        saveAll(all)
        return record
      }
    } catch {
      // fallback to local
    }

    const record: UserAddress = {
      id: `adr-${Math.random().toString(36).slice(2, 10)}`,
      user_id,
      ...input,
      is_primary: input.is_primary === true,
      created_at: new Date().toISOString(),
    }
    const all = [...loadAll(), record]
    saveAll(all)
    return record
  },

  async update(id: string, input: AddressInput): Promise<UserAddress | null> {
    try {
      const res = await api.put<{ success: boolean; data: BackendAddress }>(`/core/addresses/${id}`, {
        label: input.label,
        recipient_name: input.recipient_name,
        recipient_phone: input.recipient_phone,
        address_line_1: input.address_line_1,
        address_line_2: input.address_line_2,
        district: input.district,
        city: input.city,
        province: input.province,
        postal_code: input.postal_code,
        country_code: input.country_code,
        is_primary: input.is_primary ?? false,
      })
      if (res.data?.data) {
        const updated = mapBackendAddress(res.data.data)
        const all = loadAll().map((a) => (a.id === id ? updated : a))
        saveAll(all)
        return updated
      }
    } catch {
      // fallback
    }

    const all = loadAll()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    const updated: UserAddress = {
      ...all[idx],
      ...input,
      updated_at: new Date().toISOString(),
    }
    all[idx] = updated
    saveAll(all)
    return updated
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/core/addresses/${id}`)
    } catch {
      // fallback
    }
    saveAll(loadAll().filter((a) => a.id !== id))
  },
}

export type { DbUserAddress }
