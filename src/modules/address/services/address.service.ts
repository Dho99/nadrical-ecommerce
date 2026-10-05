import api, { unwrapData, getErrorMessage } from '../../../shared/lib/api'
import type { AddressInput, UserAddress } from '../types/address.type'

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

export const addressService = {
  async fetchAddresses(): Promise<UserAddress[]> {
    const res = await api.get<{ success: boolean; message: string; data?: BackendAddress[] }>('/core/addresses')
    const data = unwrapData<BackendAddress[]>(res.data as unknown as { success: boolean; message: string; data?: BackendAddress[] }) ?? res.data.data
    if (!Array.isArray(data)) throw new Error(res.data.message || 'Failed to fetch addresses')
    return data.map(mapBackendAddress)
  },

  listByEmail(_email: string): UserAddress[] {
    throw new Error('listByEmail deprecated — gunakan fetchAddresses()')
  },

  async add(_email: string, input: AddressInput): Promise<UserAddress> {
    try {
      const res = await api.post<{ success: boolean; message: string; data?: BackendAddress }>('/core/addresses', {
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
      const data = unwrapData<BackendAddress>(res.data as unknown as { success: boolean; message: string; data?: BackendAddress }) ?? res.data.data
      if (!data) throw new Error(res.data.message || 'Failed to create address')
      return mapBackendAddress(data)
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal tambah alamat'), { cause: e })
    }
  },

  async update(id: string, input: AddressInput): Promise<UserAddress | null> {
    try {
      const res = await api.put<{ success: boolean; message: string; data?: BackendAddress }>(`/core/addresses/${id}`, {
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
      const data = unwrapData<BackendAddress>(res.data as unknown as { success: boolean; message: string; data?: BackendAddress }) ?? res.data.data
      if (!data) throw new Error(res.data.message || 'Failed to update address')
      return mapBackendAddress(data)
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal update alamat'), { cause: e })
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/core/addresses/${id}`)
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal hapus alamat'), { cause: e })
    }
  },

  async setPrimary(id: string): Promise<void> {
    await api.patch(`/core/addresses/${id}/primary`)
  },
}

export type { UserAddress }
