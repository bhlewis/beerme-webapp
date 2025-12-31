import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { barcodesApi } from '../api/barcodes'
import type { BarcodeCreate, BarcodeUpdate, BarcodesParams } from '../api/types'
import toast from 'react-hot-toast'

export function useBarcodes(params?: BarcodesParams) {
  return useQuery({
    queryKey: ['barcodes', params],
    queryFn: () => barcodesApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useBarcode(upcCode: string) {
  return useQuery({
    queryKey: ['barcodes', upcCode],
    queryFn: () => barcodesApi.get(upcCode),
    enabled: !!upcCode,
  })
}

export function useCreateBarcode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BarcodeCreate) => barcodesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcodes'] })
      toast.success('Barcode created')
    },
    onError: () => {
      toast.error('Failed to create barcode')
    },
  })
}

export function useUpdateBarcode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ upcCode, data }: { upcCode: string; data: BarcodeUpdate }) => barcodesApi.update(upcCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcodes'] })
      toast.success('Barcode updated')
    },
    onError: () => {
      toast.error('Failed to update barcode')
    },
  })
}

export function useDeleteBarcode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (upcCode: string) => barcodesApi.delete(upcCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcodes'] })
      toast.success('Barcode deleted')
    },
    onError: () => {
      toast.error('Failed to delete barcode')
    },
  })
}
