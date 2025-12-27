import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventory'
import type { InventoryParams } from '../api/types'

export function useInventory(params?: InventoryParams) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryApi.list(params),
  })
}

export function useStaleInventory() {
  return useQuery({
    queryKey: ['inventory', 'stale'],
    queryFn: () => inventoryApi.listStale(),
  })
}
