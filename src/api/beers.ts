import { apiClient } from './client'
import type { Beer, BeerWithDetails, BeerCreate, BeerUpdate, BeersParams } from './types'

export const beersApi = {
  list: async (params?: BeersParams): Promise<BeerWithDetails[]> => {
    const { data } = await apiClient.get('/beers', { params })
    return data
  },

  get: async (id: number): Promise<BeerWithDetails> => {
    const { data } = await apiClient.get(`/beers/${id}`)
    return data
  },

  create: async (beer: BeerCreate): Promise<Beer> => {
    const { data } = await apiClient.post('/beers', beer)
    return data
  },

  update: async (id: number, beer: BeerUpdate): Promise<Beer> => {
    const { data } = await apiClient.patch(`/beers/${id}`, beer)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/beers/${id}`)
  },
}
