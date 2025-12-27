import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBarcodes, useCreateBarcode, useUpdateBarcode, useDeleteBarcode } from '../hooks/useBarcodes'
import { useBeers } from '../hooks/useBeers'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { BarcodeCreate, BarcodeWithBeer } from '../api/types'

export function BarcodesPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBarcode, setEditingBarcode] = useState<BarcodeWithBeer | null>(null)
  const [deletingBarcode, setDeletingBarcode] = useState<BarcodeWithBeer | null>(null)

  const { data: barcodes, isLoading } = useBarcodes({ beer_name: search || undefined })
  const { data: beers } = useBeers()
  const createMutation = useCreateBarcode()
  const updateMutation = useUpdateBarcode()
  const deleteMutation = useDeleteBarcode()

  const { register, handleSubmit, reset } = useForm<BarcodeCreate>()

  const openCreateModal = () => {
    setEditingBarcode(null)
    reset({ upc_code: '', beer_id: undefined, container_type: '', unit_count: 1 })
    setIsModalOpen(true)
  }

  const openEditModal = (barcode: BarcodeWithBeer) => {
    setEditingBarcode(barcode)
    reset({
      upc_code: barcode.upc_code,
      beer_id: barcode.beer_id,
      container_type: barcode.container_type,
      unit_count: barcode.unit_count,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: BarcodeCreate) => {
    if (editingBarcode) {
      await updateMutation.mutateAsync({
        upcCode: editingBarcode.upc_code,
        data: { beer_id: data.beer_id, container_type: data.container_type, unit_count: data.unit_count },
      })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsModalOpen(false)
  }

  const onDelete = async () => {
    if (deletingBarcode) {
      await deleteMutation.mutateAsync(deletingBarcode.upc_code)
      setDeletingBarcode(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Barcodes</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Barcode
        </button>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by beer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">UPC Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Beer</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Container</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Units</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {barcodes?.map((barcode) => (
              <tr key={barcode.upc_code}>
                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900">{barcode.upc_code}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{barcode.beer?.name ?? 'Unknown Beer'}</div>
                    <div className="text-sm text-gray-500">{barcode.beer?.brewery?.name ?? 'Unknown Brewery'}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{barcode.container_type}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{barcode.unit_count}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button onClick={() => openEditModal(barcode)} className="text-amber-600 hover:text-amber-900 mr-3">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingBarcode(barcode)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {barcodes?.length === 0 && <p className="py-8 text-center text-gray-500">No barcodes found</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBarcode ? 'Edit Barcode' : 'Add Barcode'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">UPC Code</label>
            <input {...register('upc_code', { required: true })} disabled={!!editingBarcode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Beer</label>
            <select {...register('beer_id', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm">
              <option value="">Select beer</option>
              {beers?.map((b) => <option key={b.id} value={b.id}>{b.name} - {b.brewery.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Container Type</label>
            <input {...register('container_type', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="e.g., 16oz Can, 12oz Bottle" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Count</label>
            <input type="number" min="1" {...register('unit_count', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="Units per scan (e.g., 4 for a 4-pack)" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500">{editingBarcode ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingBarcode}
        onClose={() => setDeletingBarcode(null)}
        onConfirm={onDelete}
        title="Delete Barcode"
        message={`Are you sure you want to delete barcode "${deletingBarcode?.upc_code}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
