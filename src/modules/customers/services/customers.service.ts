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

export const customersService = {
  async getById(id: string): Promise<Customer | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: BackendAkunList }>(`/ecommerce/customers/${id}`)
      const data = unwrapData<BackendAkunList>(res.data as unknown as { success: boolean; message: string; data?: BackendAkunList }) ?? res.data.data
      return data ? toCustomer(data) : null
    } catch {
      return null
    }
  },

  async list(params: { page?: number; limit?: number; search?: string } = {}): Promise<CustomerPage> {
    const page = Math.max(1, params.page ?? 1)
    const limit = Math.max(1, Math.min(100, params.limit ?? 20))
    const query: Record<string, string | number> = { page, limit }
    if (params.search?.trim()) query.search = params.search.trim()
    try {
      const res = await api.get('/ecommerce/customers', { params: query })
      const raw = res.data as unknown as Record<string, unknown>
      const data = unwrapData<BackendAkunList[] | BackendAkunList>(raw) ?? (raw as { data?: BackendAkunList[] })?.data
      const items = Array.isArray(data) ? data.map(toCustomer) : data ? [toCustomer(data as BackendAkunList)] : []
      const meta = unwrapMeta(raw)
      const total = typeof meta?.total === 'number' ? meta.total : items.length
      return { items, total, page, limit }
    } catch (e) {
      throw new Error(getErrorMessage(e, 'Gagal memuat daftar customer'), { cause: e })
    }
  },
}
