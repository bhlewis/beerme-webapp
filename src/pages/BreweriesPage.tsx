import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBreweries, useCreateBrewery, useUpdateBrewery, useDeleteBrewery } from '../hooks/useBreweries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { SearchBox } from '../components/common/SearchBox'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import type { BreweryCreate, Brewery } from '../api/types'

export function BreweriesPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrewery, setEditingBrewery] = useState<Brewery | null>(null)
  const [deletingBrewery, setDeletingBrewery] = useState<Brewery | null>(null)

  const { data: breweries, isLoading, isFetching } = useBreweries({ name: search || undefined })
  const createMutation = useCreateBrewery()
  const updateMutation = useUpdateBrewery()
  const deleteMutation = useDeleteBrewery()

  const { register, handleSubmit, reset } = useForm<BreweryCreate>()

  const openCreateModal = () => {
    setEditingBrewery(null)
    reset({ name: '', location: '', category: '', website: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (brewery: Brewery) => {
    setEditingBrewery(brewery)
    reset({
      name: brewery.name,
      location: brewery.location ?? '',
      category: brewery.category ?? '',
      website: brewery.website ?? '',
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: BreweryCreate) => {
    if (editingBrewery) {
      await updateMutation.mutateAsync({ id: editingBrewery.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsModalOpen(false)
  }

  const onDelete = async () => {
    if (deletingBrewery) {
      await deleteMutation.mutateAsync(deletingBrewery.id)
      setDeletingBrewery(null)
    }
  }

  // Show full-page loading only on initial load
  if (isLoading && !breweries) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Breweries</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Brewery
        </button>
      </div>

      <div className="mt-6 mb-8">
        <SearchBox
          placeholder="Search breweries by name..."
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
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Website</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {breweries?.map((brewery) => (
              <tr key={brewery.id} className="group hover:bg-amber-50/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-semibold text-stone-800">{brewery.name}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-600">{brewery.location || '—'}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  {brewery.category ? (
                    <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                      {brewery.category}
                    </span>
                  ) : (
                    <span className="text-sm text-stone-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {brewery.website ? (
                    <a
                      href={brewery.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-xs font-medium">Visit</span>
                    </a>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(brewery)}
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBrewery(brewery)}
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
        {breweries?.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-stone-400">No breweries found</p>
            {search && <p className="mt-1 text-sm text-stone-400">Try adjusting your search</p>}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBrewery ? 'Edit Brewery' : 'Add Brewery'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input {...register('location')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="City, State" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input {...register('category')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="Micro, Macro, Regional, etc." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input type="url" {...register('website')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="https://" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500">{editingBrewery ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingBrewery}
        onClose={() => setDeletingBrewery(null)}
        onConfirm={onDelete}
        title="Delete Brewery"
        message={`Are you sure you want to delete "${deletingBrewery?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
