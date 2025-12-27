import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBeers, useCreateBeer, useUpdateBeer, useDeleteBeer } from '../hooks/useBeers'
import { useBreweries } from '../hooks/useBreweries'
import { useStyles } from '../hooks/useStyles'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { formatAbv, formatIbu } from '../utils/formatters'
import type { BeerCreate, BeerWithDetails } from '../api/types'

export function BeersPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBeer, setEditingBeer] = useState<BeerWithDetails | null>(null)
  const [deletingBeer, setDeletingBeer] = useState<BeerWithDetails | null>(null)

  const { data: beers, isLoading } = useBeers({ name: search || undefined })
  const { data: breweries } = useBreweries()
  const { data: styles } = useStyles()
  const createMutation = useCreateBeer()
  const updateMutation = useUpdateBeer()
  const deleteMutation = useDeleteBeer()

  const { register, handleSubmit, reset } = useForm<BeerCreate>()

  const openCreateModal = () => {
    setEditingBeer(null)
    reset({ name: '', brewery_id: undefined, style_id: undefined, abv: undefined, ibu: undefined })
    setIsModalOpen(true)
  }

  const openEditModal = (beer: BeerWithDetails) => {
    setEditingBeer(beer)
    reset({
      name: beer.name,
      brewery_id: beer.brewery.id,
      style_id: beer.style.id,
      abv: beer.abv ?? undefined,
      ibu: beer.ibu ?? undefined,
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: BeerCreate) => {
    if (editingBeer) {
      await updateMutation.mutateAsync({ id: editingBeer.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsModalOpen(false)
  }

  const onDelete = async () => {
    if (deletingBeer) {
      await deleteMutation.mutateAsync(deletingBeer.id)
      setDeletingBeer(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Beers</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Beer
        </button>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search beers..."
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brewery</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Style</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ABV</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">IBU</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {beers?.map((beer) => (
              <tr key={beer.id}>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{beer.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{beer.brewery.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{beer.style.style_name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatAbv(beer.abv)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatIbu(beer.ibu)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button onClick={() => openEditModal(beer)} className="text-amber-600 hover:text-amber-900 mr-3">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingBeer(beer)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {beers?.length === 0 && <p className="py-8 text-center text-gray-500">No beers found</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBeer ? 'Edit Beer' : 'Add Beer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Brewery</label>
            <select {...register('brewery_id', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm">
              <option value="">Select brewery</option>
              {breweries?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Style</label>
            <select {...register('style_id', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm">
              <option value="">Select style</option>
              {styles?.map((s) => <option key={s.id} value={s.id}>{s.style_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ABV %</label>
              <input type="number" step="0.1" {...register('abv', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IBU</label>
              <input type="number" {...register('ibu', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500">{editingBeer ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingBeer}
        onClose={() => setDeletingBeer(null)}
        onConfirm={onDelete}
        title="Delete Beer"
        message={`Are you sure you want to delete "${deletingBeer?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
