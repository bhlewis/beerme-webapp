import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useStyles, useCreateStyle, useUpdateStyle, useDeleteStyle } from '../hooks/useStyles'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { StyleCreate, Style } from '../api/types'

export function StylesPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStyle, setEditingStyle] = useState<Style | null>(null)
  const [deletingStyle, setDeletingStyle] = useState<Style | null>(null)

  const { data: styles, isLoading } = useStyles({ name: search || undefined })
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

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Styles</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Style
        </button>
      </div>

      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search styles..."
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Style Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {styles?.map((style) => (
              <tr key={style.id}>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{style.style_name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button onClick={() => openEditModal(style)} className="text-amber-600 hover:text-amber-900 mr-3">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeletingStyle(style)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {styles?.length === 0 && <p className="py-8 text-center text-gray-500">No styles found</p>}
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
