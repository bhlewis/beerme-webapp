import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stylesApi } from '../api/styles'
import type { StyleCreate, StyleUpdate, StylesParams } from '../api/types'
import toast from 'react-hot-toast'

export function useStyles(params?: StylesParams) {
  return useQuery({
    queryKey: ['styles', params],
    queryFn: () => stylesApi.list(params),
  })
}

export function useStyle(id: number) {
  return useQuery({
    queryKey: ['styles', id],
    queryFn: () => stylesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateStyle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StyleCreate) => stylesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
      toast.success('Style created')
    },
    onError: () => {
      toast.error('Failed to create style')
    },
  })
}

export function useUpdateStyle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StyleUpdate }) => stylesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
      toast.success('Style updated')
    },
    onError: () => {
      toast.error('Failed to update style')
    },
  })
}

export function useDeleteStyle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => stylesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] })
      toast.success('Style deleted')
    },
    onError: () => {
      toast.error('Failed to delete style')
    },
  })
}
