import api from '../../../shared/lib/api'

export interface Tax {
  uuid: string
  name: string
  rate: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export const taxService = {
  async list(params?: { status?: string }): Promise<Tax[]> {
    const res = await api.get<Tax[]>('/ecommerce/taxes', { params })
    return (res.data as unknown as Tax[]) ?? []
  },

  async getById(id: string): Promise<Tax | null> {
    try {
      const res = await api.get<Tax>(`/ecommerce/taxes/${id}`)
      return (res.data as unknown as Tax) ?? null
    } catch {
      return null
    }
  },

  async create(tax: Omit<Tax, 'uuid' | 'created_at' | 'updated_at'>): Promise<Tax> {
    const res = await api.post<Tax>('/ecommerce/taxes', tax)
    return res.data as unknown as Tax
  },

  async update(id: string, patch: Partial<Tax>): Promise<Tax> {
    const res = await api.put<Tax>(`/ecommerce/taxes/${id}`, patch)
    return res.data as unknown as Tax
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/ecommerce/taxes/${id}`)
  },
}
