import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBeers, useCreateBeer, useUpdateBeer, useDeleteBeer } from '../hooks/useBeers'
import { useBreweries } from '../hooks/useBreweries'
import { useStyles } from '../hooks/useStyles'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { SearchBox } from '../components/common/SearchBox'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { formatAbv, formatIbu } from '../utils/formatters'
import clsx from 'clsx'
import type { BeerCreate, BeerWithDetails } from '../api/types'

export function BeersPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBeer, setEditingBeer] = useState<BeerWithDetails | null>(null)
  const [deletingBeer, setDeletingBeer] = useState<BeerWithDetails | null>(null)

  const { data: beers, isLoading, isFetching } = useBeers({ name: search || undefined })
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

  // Show full-page loading only on initial load
  if (isLoading && !beers) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Beers</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Beer
        </button>
      </div>

      <div className="mt-6 mb-8">
        <SearchBox
          placeholder="Search beers by name..."
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
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Brewery</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Style</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">ABV</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">IBU</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {beers?.map((beer, index) => (
              <tr
                key={beer.id}
                className="group hover:bg-amber-50/50"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-semibold text-stone-800">{beer.name}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-600">{beer.brewery.name}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                    {beer.style.style_name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-mono text-sm text-stone-600">{formatAbv(beer.abv)}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-mono text-sm text-stone-600">{formatIbu(beer.ibu)}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(beer)}
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBeer(beer)}
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
        {beers?.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-stone-400">No beers found</p>
            {search && <p className="mt-1 text-sm text-stone-400">Try adjusting your search</p>}
          </div>
        )}
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
