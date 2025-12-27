import { apiClient } from './client'
import type { Transaction, TransactionsParams } from './types'

export const transactionsApi = {
  list: async (params?: TransactionsParams): Promise<Transaction[]> => {
    const { data } = await apiClient.get('/transactions', { params })
    return data
  },
}
