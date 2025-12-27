import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBreweries, useCreateBrewery, useUpdateBrewery, useDeleteBrewery } from '../hooks/useBreweries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react'
import type { BreweryCreate, Brewery } from '../api/types'

export function BreweriesPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrewery, setEditingBrewery] = useState<Brewery | null>(null)
  const [deletingBrewery, setDeletingBrewery] = useState<Brewery | null>(null)

  const { data: breweries, isLoading } = useBreweries({ name: search || undefined })
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

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Breweries</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Brewery
        </button>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search breweries..."
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Website</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {breweries?.map((brewery) => (
              <tr key={brewery.id}>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{brewery.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{brewery.location || '-'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{brewery.category || '-'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {brewery.website ? (
                    <a href={brewery.website} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-900">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button onClick={() => openEditModal(brewery)} className="text-amber-600 hover:text-amber-900 mr-3">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingBrewery(brewery)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {breweries?.length === 0 && <p className="py-8 text-center text-gray-500">No breweries found</p>}
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
