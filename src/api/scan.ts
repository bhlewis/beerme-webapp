import { apiClient } from './client'
import type { ScanIn, ScanOut, InventoryResponse } from './types'

export const scanApi = {
  scanIn: async (data: ScanIn): Promise<InventoryResponse> => {
    const response = await apiClient.post('/scan/in', data)
    return response.data
  },

  scanOut: async (data: ScanOut): Promise<InventoryResponse> => {
    const response = await apiClient.post('/scan/out', data)
    return response.data
  },
}
