import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useStyles, useCreateStyle, useUpdateStyle, useDeleteStyle } from '../hooks/useStyles'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { SearchBox } from '../components/common/SearchBox'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { StyleCreate, Style } from '../api/types'

export function StylesPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStyle, setEditingStyle] = useState<Style | null>(null)
  const [deletingStyle, setDeletingStyle] = useState<Style | null>(null)

  const { data: styles, isLoading, isFetching } = useStyles({ name: search || undefined })
  const createMutation = useCreateStyle()
  const updateMutation = useUpdateStyle()
  const deleteMutation = useDeleteStyle()

  const { register, handleSubmit, reset } = useForm<StyleCreate>()

  const openCreateModal = () => {
    setEditingStyle(null)
    reset({ style_name: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (style: Style) => {
    setEditingStyle(style)
    reset({ style_name: style.style_name })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: StyleCreate) => {
    if (editingStyle) {
      await updateMutation.mutateAsync({ id: editingStyle.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsModalOpen(false)
  }

  const onDelete = async () => {
    if (deletingStyle) {
      await deleteMutation.mutateAsync(deletingStyle.id)
      setDeletingStyle(null)
    }
  }

  // Show full-page loading only on initial load
  if (isLoading && !styles) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Styles</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Style
        </button>
      </div>

      <div className="mt-6 mb-8">
        <SearchBox
          placeholder="Search styles..."
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
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">Style Name</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {styles?.map((style) => (
              <tr key={style.id} className="group hover:bg-amber-50/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-semibold text-stone-800">{style.style_name}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(style)}
                      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingStyle(style)}
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
        {styles?.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-stone-400">No styles found</p>
            {search && <p className="mt-1 text-sm text-stone-400">Try adjusting your search</p>}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStyle ? 'Edit Style' : 'Add Style'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Style Name</label>
            <input {...register('style_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" placeholder="e.g., IPA, Lager, Stout" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500">{editingStyle ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingStyle}
        onClose={() => setDeletingStyle(null)}
        onConfirm={onDelete}
        title="Delete Style"
        message={`Are you sure you want to delete "${deletingStyle?.style_name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
