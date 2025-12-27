import { useState, useCallback } from 'react'
import { useInventory } from '../hooks/useInventory'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { FreshnessIndicator } from '../components/common/FreshnessIndicator'
import { InventorySearch } from '../components/common/InventorySearch'
import { formatDate, formatCurrency } from '../utils/formatters'
import { ArrowUpDown } from 'lucide-react'
import type { InventoryParams, InventoryWithBeer } from '../api/types'

export function InventoryPage() {
  const [params, setParams] = useState<InventoryParams>({
    in_stock_only: true,
    order_by: 'days_old',
    order_dir: 'desc',
  })
  const [filteredInventory, setFilteredInventory] = useState<InventoryWithBeer[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: inventory, isLoading } = useInventory(params)

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
        <label className="flex items-center self-start">
          <input
            type="checkbox"
            checked={params.in_stock_only}
            onChange={(e) => setParams((prev) => ({ ...prev, in_stock_only: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="ml-2 text-sm text-gray-700">In stock only</span>
        </label>
      </div>

      {/* Search */}
      <div className="mt-4">
        <InventorySearch
          inventory={inventory ?? []}
          onFilter={handleFilter}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
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
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                onClick={() => toggleSort('quantity')}
              >
                <span className="flex items-center">
                  Qty
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </span>
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayInventory?.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{item.beer.name}</div>
                    <div className="text-sm text-gray-500">{item.beer.brewery.name}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {item.beer.style.style_name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {item.quantity}
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
              </tr>
            ))}
          </tbody>
        </table>
        {displayInventory?.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            {searchQuery ? `No results for "${searchQuery}"` : 'No inventory found'}
          </p>
        )}
      </div>
    </div>
  )
}
