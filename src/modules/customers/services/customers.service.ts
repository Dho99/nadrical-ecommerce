import api, { unwrapData, unwrapMeta, getErrorMessage } from '../../../shared/lib/api'
import type { Customer, CustomerPage } from '../types/customer.type'

interface BackendAkunList {
  uuid?: string
  id?: string
  email: string
  username?: string
  full_name?: string
  phone?: string
  avatar_url?: string
  image?: string
  status?: string
  created_at?: string
  roles?: { nama_role: string }[]
}

function toCustomer(a: BackendAkunList): Customer {
  return {
    id: a.uuid || a.id || '',
    email: a.email,
    full_name: a.full_name || a.username || a.email.split('@')[0],
    username: a.username,
    phone: a.phone,
    avatar_url: a.avatar_url || a.image,
    status: a.status,
    role_name: a.roles?.[0]?.nama_role,
    created_at: a.created_at,
  }
}

const CANDIDATE_ENDPOINTS = ['/ecommerce/customers', '/auth/users', '/auth/accounts', '/users', '/customers'] as const

export const customersService = {
  async list(params: { page?: number; limit?: number; search?: string } = {}): Promise<CustomerPage> {
    const page = Math.max(1, params.page ?? 1)
    const limit = Math.max(1, Math.min(100, params.limit ?? 20))
    const query: Record<string, string | number> = { page, limit }
    if (params.search?.trim()) query.search = params.search.trim()
    let lastErr: unknown = null
    for (const path of CANDIDATE_ENDPOINTS) {
      try {
        const res = await api.get(path, { params: query })
        const raw = res.data as unknown as Record<string, unknown>
        const data = unwrapData<BackendAkunList[] | BackendAkunList>(raw) ?? (raw as { data?: BackendAkunList[] })?.data
        const items = Array.isArray(data) ? data.map(toCustomer) : data ? [toCustomer(data as BackendAkunList)] : []
        const meta = unwrapMeta(raw)
        const total = typeof meta?.total === 'number' ? meta.total : items.length
        return { items, total, page, limit }
      } catch (e) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 404 || status === 405) {
          lastErr = e
          continue
        }
        throw new Error(getErrorMessage(e, 'Gagal memuat daftar customer'))
      }
    }
    const msg = lastErr ? getErrorMessage(lastErr, '') : ''
    throw new Error(msg || 'Endpoint daftar customer belum tersedia di backend. Hubungi admin untuk mengaktifkan GET /ecommerce/customers.')
  },
}
