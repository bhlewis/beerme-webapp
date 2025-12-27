import { apiClient } from './client'

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const { data } = await apiClient.get('/health')
    return data
  },
}
