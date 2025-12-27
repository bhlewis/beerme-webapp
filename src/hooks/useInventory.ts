import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventory'
import type { InventoryParams, InventoryCreate, InventoryUpdate } from '../api/types'
import toast from 'react-hot-toast'

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

export function useCreateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InventoryCreate) => inventoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory item added')
    },
    onError: () => {
      toast.error('Failed to add inventory item')
    },
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryUpdate }) => inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory item updated')
    },
    onError: () => {
      toast.error('Failed to update inventory item')
    },
  })
}

export function useDeleteInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory item deleted')
    },
    onError: () => {
      toast.error('Failed to delete inventory item')
    },
  })
}
