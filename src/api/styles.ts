import { apiClient } from './client'
import type { Style, StyleCreate, StyleUpdate, StylesParams } from './types'

export const stylesApi = {
  list: async (params?: StylesParams): Promise<Style[]> => {
    const { data } = await apiClient.get('/styles', { params })
    return data
  },

  get: async (id: number): Promise<Style> => {
    const { data } = await apiClient.get(`/styles/${id}`)
    return data
  },

  create: async (style: StyleCreate): Promise<Style> => {
    const { data } = await apiClient.post('/styles', style)
    return data
  },

  update: async (id: number, style: StyleUpdate): Promise<Style> => {
    const { data } = await apiClient.patch(`/styles/${id}`, style)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/styles/${id}`)
  },
}
