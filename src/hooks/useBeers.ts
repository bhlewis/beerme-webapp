import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { beersApi } from '../api/beers'
import type { BeerCreate, BeerUpdate, BeersParams } from '../api/types'
import toast from 'react-hot-toast'

export function useBeers(params?: BeersParams) {
  return useQuery({
    queryKey: ['beers', params],
    queryFn: () => beersApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useBeer(id: number) {
  return useQuery({
    queryKey: ['beers', id],
    queryFn: () => beersApi.get(id),
    enabled: !!id,
  })
}

export function useCreateBeer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BeerCreate) => beersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beers'] })
      toast.success('Beer created')
    },
    onError: () => {
      toast.error('Failed to create beer')
    },
  })
}

export function useUpdateBeer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BeerUpdate }) => beersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beers'] })
      toast.success('Beer updated')
    },
    onError: () => {
      toast.error('Failed to update beer')
    },
  })
}

export function useDeleteBeer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => beersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beers'] })
      toast.success('Beer deleted')
    },
    onError: () => {
      toast.error('Failed to delete beer')
    },
  })
}
