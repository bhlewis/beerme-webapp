import { apiClient } from './client'
import type { BarcodeWithBeer, BarcodeCreate, BarcodeUpdate, BarcodesParams } from './types'

export const barcodesApi = {
  list: async (params?: BarcodesParams): Promise<BarcodeWithBeer[]> => {
    const { data } = await apiClient.get('/barcodes', { params })
    return data
  },

  get: async (upcCode: string): Promise<BarcodeWithBeer> => {
    const { data } = await apiClient.get(`/barcodes/${upcCode}`)
    return data
  },

  create: async (barcode: BarcodeCreate): Promise<BarcodeWithBeer> => {
    const { data } = await apiClient.post('/barcodes', barcode)
    return data
  },

  update: async (upcCode: string, barcode: BarcodeUpdate): Promise<BarcodeWithBeer> => {
    const { data } = await apiClient.patch(`/barcodes/${upcCode}`, barcode)
    return data
  },

  delete: async (upcCode: string): Promise<void> => {
    await apiClient.delete(`/barcodes/${upcCode}`)
  },
}
