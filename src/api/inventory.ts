import { apiClient } from './client'
import type { InventoryWithBeer, InventoryParams, InventoryCreate, InventoryUpdate } from './types'

export const inventoryApi = {
  list: async (params?: InventoryParams): Promise<InventoryWithBeer[]> => {
    const { data } = await apiClient.get('/inventory', { params })
    return data
  },

  listStale: async (params?: Omit<InventoryParams, 'in_stock_only'>): Promise<InventoryWithBeer[]> => {
    const { data } = await apiClient.get('/inventory/stale', { params })
    return data
  },

  get: async (id: number): Promise<InventoryWithBeer> => {
    const { data } = await apiClient.get(`/inventory/${id}`)
    return data
  },

  create: async (item: InventoryCreate): Promise<InventoryWithBeer> => {
    const { data } = await apiClient.post('/inventory', item)
    return data
  },

  update: async (id: number, item: InventoryUpdate): Promise<InventoryWithBeer> => {
    const { data } = await apiClient.patch(`/inventory/${id}`, item)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`)
  },
}
