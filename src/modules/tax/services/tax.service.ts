import api, { unwrapData } from '../../../shared/lib/api'

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
    const res = await api.get<{ success: boolean; message: string; data?: Tax[] }>('/ecommerce/taxes', { params })
    return unwrapData<Tax[]>(res.data as unknown as { success: boolean; message: string; data?: Tax[] }) ?? res.data.data ?? []
  },

  async getById(id: string): Promise<Tax | null> {
    try {
      const res = await api.get<{ success: boolean; message: string; data?: Tax }>(`/ecommerce/taxes/${id}`)
      return unwrapData<Tax>(res.data as unknown as { success: boolean; message: string; data?: Tax }) ?? res.data.data ?? null
    } catch {
      return null
    }
  },

  async create(tax: Omit<Tax, 'uuid' | 'created_at' | 'updated_at'>): Promise<Tax> {
    const res = await api.post<{ success: boolean; message: string; data?: Tax }>('/ecommerce/taxes', tax)
    const data = unwrapData<Tax>(res.data as unknown as { success: boolean; message: string; data?: Tax }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to create tax')
    return data
  },

  async update(id: string, patch: Partial<Tax>): Promise<Tax> {
    const res = await api.put<{ success: boolean; message: string; data?: Tax }>(`/ecommerce/taxes/${id}`, patch)
    const data = unwrapData<Tax>(res.data as unknown as { success: boolean; message: string; data?: Tax }) ?? res.data.data
    if (!data) throw new Error(res.data.message || 'Failed to update tax')
    return data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/ecommerce/taxes/${id}`)
  },
}
