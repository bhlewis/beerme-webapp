import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scanApi } from '../api/scan'
import type { ScanIn, ScanOut } from '../api/types'
import toast from 'react-hot-toast'

export function useScanIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScanIn) => scanApi.scanIn(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(`Added ${result.quantity} to inventory`)
    },
    onError: () => {
      toast.error('Scan failed - check barcode')
    },
  })
}

export function useScanOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScanOut) => scanApi.scanOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Removed from inventory')
    },
    onError: () => {
      toast.error('Scan failed - check barcode or quantity')
    },
  })
}
