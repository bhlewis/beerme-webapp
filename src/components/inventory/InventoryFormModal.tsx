import { Fragment, useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { X, Package, Calendar, DollarSign, Hash } from 'lucide-react'
import clsx from 'clsx'
import { BeerAutocomplete } from '../common/BeerAutocomplete'
import type { InventoryWithBeer, InventoryCreate, BeerWithDetails } from '../../api/types'

interface InventoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InventoryCreate) => Promise<void>
  editingItem?: InventoryWithBeer | null
  isLoading?: boolean
}

export function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading = false,
}: InventoryFormModalProps) {
  const [beerId, setBeerId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [packagedDate, setPackagedDate] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setBeerId(editingItem.beer.id)
        setQuantity(editingItem.quantity)
        setPackagedDate(editingItem.packaged_date ?? '')
        setPurchasePrice(editingItem.purchase_price?.toString() ?? '')
      } else {
        setBeerId(null)
        setQuantity(1)
        setPackagedDate('')
        setPurchasePrice('')
      }
      setErrors({})
    }
  }, [isOpen, editingItem])

  const handleBeerChange = (id: number | null, _beer: BeerWithDetails | null) => {
    setBeerId(id)
    if (id) {
      setErrors((prev) => ({ ...prev, beer: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!beerId) {
      newErrors.beer = 'Please select a beer'
    }
    if (quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1'
    }
    if (purchasePrice && isNaN(parseFloat(purchasePrice))) {
      newErrors.price = 'Invalid price'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const data: InventoryCreate = {
      beer_id: beerId!,
      quantity,
      packaged_date: packagedDate || null,
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
    }

    await onSubmit(data)
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-visible rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 rounded-t-2xl">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIgY3g9IjIwIiBjeT0iMjAiIHI9IjMiLz48L2c+PC9zdmc+')] opacity-30 rounded-t-2xl" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle as="h3" className="text-lg font-semibold text-white">
                        {editingItem ? 'Edit Inventory Item' : 'Add to Inventory'}
                      </DialogTitle>
                      <p className="text-sm text-amber-100">
                        {editingItem ? 'Update the details below' : 'Add a new beer to your fridge'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Beer Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beer <span className="text-red-500">*</span>
                    </label>
                    <BeerAutocomplete
                      value={beerId}
                      onChange={handleBeerChange}
                      placeholder="Search by name, brewery, or style..."
                      disabled={isLoading}
                      error={!!errors.beer}
                    />
                    {errors.beer && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.beer}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        disabled={isLoading}
                        className={clsx(
                          'block w-full rounded-xl border-2 bg-white py-3 pl-11 pr-4',
                          'text-sm text-gray-900 placeholder-gray-400',
                          'transition-all duration-200',
                          'focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100',
                          errors.quantity
                            ? 'border-red-300'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      />
                    </div>
                    {errors.quantity && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.quantity}</p>
                    )}
                  </div>

                  {/* Two column layout for date and price */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Packaged Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Packaged Date
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={packagedDate}
                          onChange={(e) => setPackagedDate(e.target.value)}
                          disabled={isLoading}
                          className={clsx(
                            'block w-full rounded-xl border-2 bg-white py-3 pl-11 pr-4',
                            'text-sm text-gray-900',
                            'transition-all duration-200',
                            'focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100',
                            'border-gray-200 hover:border-gray-300'
                          )}
                        />
                      </div>
                    </div>

                    {/* Purchase Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          disabled={isLoading}
                          className={clsx(
                            'block w-full rounded-xl border-2 bg-white py-3 pl-11 pr-4',
                            'text-sm text-gray-900 placeholder-gray-400',
                            'transition-all duration-200',
                            'focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100',
                            errors.price
                              ? 'border-red-300'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.price}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 text-sm font-medium',
                        'bg-white text-gray-700 border-2 border-gray-200',
                        'hover:bg-gray-50 hover:border-gray-300',
                        'transition-all duration-200',
                        'disabled:opacity-50'
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={clsx(
                        'rounded-xl px-5 py-2.5 text-sm font-semibold',
                        'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                        'hover:from-amber-600 hover:to-orange-600',
                        'shadow-lg shadow-amber-500/25',
                        'transition-all duration-200',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {editingItem ? 'Updating...' : 'Adding...'}
                        </span>
                      ) : (
                        editingItem ? 'Update Item' : 'Add to Inventory'
                      )}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
