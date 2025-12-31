import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBarcodes, useCreateBarcode, useUpdateBarcode, useDeleteBarcode } from '../hooks/useBarcodes'
import { useBeers } from '../hooks/useBeers'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { SearchBox } from '../components/common/SearchBox'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { BarcodeCreate, BarcodeWithBeer } from '../api/types'

export function BarcodesPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBarcode, setEditingBarcode] = useState<BarcodeWithBeer | null>(null)
  const [deletingBarcode, setDeletingBarcode] = useState<BarcodeWithBeer | null>(null)

  const { data: barcodes, isLoading, isFetching } = useBarcodes({ beer_name: search || undefined })
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

  // Show full-page loading only on initial load
  if (isLoading && !barcodes) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Barcodes</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Barcode
        </button>
      </div>

      <div className="mt-6 mb-8">
        <SearchBox
          placeholder="Search by beer name..."
          value={search}
          onChange={setSearch}
          isLoading={isFetching && !!search}
          className="max-w-md"
        />
      </div>

      <div className={clsx(
        'overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60',
        'transition-opacity duration-200',
        isFetching && 'opacity-70'
      )}>
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">UPC Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Beer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Container</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Units</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {barcodes?.map((barcode) => (
              <tr key={barcode.upc_code} className="group hover:bg-amber-50/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <code className="rounded bg-stone-100 px-2 py-1 font-mono text-sm text-stone-700">
                    {barcode.upc_code}
                  </code>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-semibold text-stone-800">{barcode.beer?.name ?? 'Unknown Beer'}</div>
                    <div className="text-sm text-stone-500">{barcode.beer?.brewery?.name ?? 'Unknown Brewery'}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                    {barcode.container_type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-mono text-sm text-stone-600">{barcode.unit_count}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(barcode)}
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBarcode(barcode)}
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {barcodes?.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-stone-400">No barcodes found</p>
            {search && <p className="mt-1 text-sm text-stone-400">Try adjusting your search</p>}
          </div>
        )}
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
