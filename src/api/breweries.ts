import { apiClient } from './client'
import type { Brewery, BreweryCreate, BreweryUpdate, BreweriesParams } from './types'

export const breweriesApi = {
  list: async (params?: BreweriesParams): Promise<Brewery[]> => {
    const { data } = await apiClient.get('/breweries', { params })
    return data
  },

  get: async (id: number): Promise<Brewery> => {
    const { data } = await apiClient.get(`/breweries/${id}`)
    return data
  },

  create: async (brewery: BreweryCreate): Promise<Brewery> => {
    const { data } = await apiClient.post('/breweries', brewery)
    return data
  },

  update: async (id: number, brewery: BreweryUpdate): Promise<Brewery> => {
    const { data } = await apiClient.patch(`/breweries/${id}`, brewery)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/breweries/${id}`)
  },
}
