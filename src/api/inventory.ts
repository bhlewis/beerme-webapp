import { apiClient } from './client'
import type { InventoryWithBeer, InventoryParams } from './types'

export const inventoryApi = {
  list: async (params?: InventoryParams): Promise<InventoryWithBeer[]> => {
    const { data } = await apiClient.get('/inventory', { params })
    return data
  },

  listStale: async (params?: Omit<InventoryParams, 'in_stock_only'>): Promise<InventoryWithBeer[]> => {
    const { data } = await apiClient.get('/inventory/stale', { params })
    return data
  },
}
