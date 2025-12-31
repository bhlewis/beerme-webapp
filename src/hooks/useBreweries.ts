import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { breweriesApi } from '../api/breweries'
import type { BreweryCreate, BreweryUpdate, BreweriesParams } from '../api/types'
import toast from 'react-hot-toast'

export function useBreweries(params?: BreweriesParams) {
  return useQuery({
    queryKey: ['breweries', params],
    queryFn: () => breweriesApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useBrewery(id: number) {
  return useQuery({
    queryKey: ['breweries', id],
    queryFn: () => breweriesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateBrewery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BreweryCreate) => breweriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breweries'] })
      toast.success('Brewery created')
    },
    onError: () => {
      toast.error('Failed to create brewery')
    },
  })
}

export function useUpdateBrewery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BreweryUpdate }) => breweriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breweries'] })
      toast.success('Brewery updated')
    },
    onError: () => {
      toast.error('Failed to update brewery')
    },
  })
}

export function useDeleteBrewery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => breweriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breweries'] })
      toast.success('Brewery deleted')
    },
    onError: () => {
      toast.error('Failed to delete brewery')
    },
  })
}
