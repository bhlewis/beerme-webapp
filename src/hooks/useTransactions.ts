import { useQuery } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions'
import type { TransactionsParams } from '../api/types'

export function useTransactions(params?: TransactionsParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsApi.list(params),
  })
}
