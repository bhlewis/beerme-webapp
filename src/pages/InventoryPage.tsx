import { useState, useCallback } from 'react'
import { useInventory, useCreateInventory, useUpdateInventory, useDeleteInventory } from '../hooks/useInventory'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { FreshnessIndicator } from '../components/common/FreshnessIndicator'
import { InventorySearch } from '../components/common/InventorySearch'
import { InventoryFormModal } from '../components/inventory/InventoryFormModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { formatDate, formatCurrency } from '../utils/formatters'
import { ArrowUpDown, Plus, Pencil, Trash2 } from 'lucide-react'
import type { InventoryParams, InventoryWithBeer, InventoryCreate } from '../api/types'

export function InventoryPage() {
  const [params, setParams] = useState<InventoryParams>({
    in_stock_only: true,
    order_by: 'days_old',
    order_dir: 'desc',
  })
  const [filteredInventory, setFilteredInventory] = useState<InventoryWithBeer[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryWithBeer | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryWithBeer | null>(null)

  const { data: inventory, isLoading } = useInventory(params)
  const createMutation = useCreateInventory()
  const updateMutation = useUpdateInventory()
  const deleteMutation = useDeleteInventory()

  const handleFilter = useCallback((filtered: InventoryWithBeer[]) => {
    setFilteredInventory(filtered)
  }, [])

  const displayInventory = filteredInventory ?? inventory

  const toggleSort = (field: string) => {
    setParams((prev) => ({
      ...prev,
      order_by: field,
      order_dir: prev.order_by === field && prev.order_dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const openAddModal = () => {
    setEditingItem(null)
    setIsFormModalOpen(true)
  }

  const openEditModal = (item: InventoryWithBeer) => {
    setEditingItem(item)
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: InventoryCreate) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setIsFormModalOpen(false)
    setEditingItem(null)
  }

  const handleDelete = async () => {
    if (deletingItem) {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  const totalBeers = displayInventory?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const totalItems = displayInventory?.length ?? 0

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalBeers} beers in stock
            {searchQuery && ` · ${totalItems} matching "${searchQuery}"`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={params.in_stock_only}
              onChange={(e) => setParams((prev) => ({ ...prev, in_stock_only: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="ml-2 text-sm text-gray-700">In stock only</span>
          </label>
          <button
            onClick={openAddModal}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <InventorySearch
          inventory={inventory ?? []}
          onFilter={handleFilter}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-lg shadow-gray-200/50">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Beer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Style
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => toggleSort('quantity')}
              >
                <span className="flex items-center">
                  Qty
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </span>
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => toggleSort('days_old')}
              >
                <span className="flex items-center">
                  Freshness
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Packaged
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayInventory?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{item.beer.name}</div>
                    <div className="text-sm text-gray-500">{item.beer.brewery.name}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {item.beer.style.style_name}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center justify-center min-w-[2rem] rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold text-gray-900">
                    {item.quantity}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <FreshnessIndicator daysOld={item.days_old} styleName={item.beer.style.style_name} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDate(item.packaged_date)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatCurrency(item.purchase_price)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="rounded-lg p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayInventory?.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery ? `No results for "${searchQuery}"` : 'No inventory found'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try a different search term' : 'Add your first beer to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add your first item
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <InventoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete ${deletingItem?.quantity}x "${deletingItem?.beer.name}" from inventory? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
