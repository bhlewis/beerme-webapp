import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useScanIn, useScanOut } from '../hooks/useScan'
import { ScanBarcode, Plus, Minus } from 'lucide-react'
import type { ScanIn, ScanOut } from '../api/types'

type ScanMode = 'in' | 'out'

const SCAN_REASONS = ['Consumed', 'Gifted', 'Spoiled', 'Expired', 'Other']

export function ScanPage() {
  const [mode, setMode] = useState<ScanMode>('in')
  const scanInMutation = useScanIn()
  const scanOutMutation = useScanOut()
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ScanIn & ScanOut>({
    defaultValues: {
      quantity: 1,
      reason: 'Consumed',
    },
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [mode])

  const onSubmit = async (data: ScanIn & ScanOut) => {
    if (mode === 'in') {
      await scanInMutation.mutateAsync({
        upc_code: data.upc_code,
        packaged_date: data.packaged_date || undefined,
        purchase_price: data.purchase_price || undefined,
      })
    } else {
      await scanOutMutation.mutateAsync({
        upc_code: data.upc_code,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes || undefined,
      })
    }
    reset()
    inputRef.current?.focus()
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <ScanBarcode className="mx-auto h-12 w-12 text-amber-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Scan Beer</h1>
        <p className="mt-1 text-sm text-gray-500">Add or remove beers from your inventory</p>
      </div>

      {/* Mode Toggle */}
      <div className="mt-6 flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('in')}
          className={`flex flex-1 items-center justify-center rounded-md py-2 text-sm font-medium ${
            mode === 'in'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Scan In
        </button>
        <button
          type="button"
          onClick={() => setMode('out')}
          className={`flex flex-1 items-center justify-center rounded-md py-2 text-sm font-medium ${
            mode === 'out'
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Minus className="mr-2 h-4 w-4" />
          Scan Out
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="upc_code" className="block text-sm font-medium text-gray-700">
            Barcode / UPC
          </label>
          <input
            type="text"
            id="upc_code"
            {...register('upc_code', { required: true })}
            ref={(e) => {
              register('upc_code').ref(e)
              // @ts-expect-error ref type mismatch
              inputRef.current = e
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            placeholder="Scan or enter barcode"
            autoComplete="off"
          />
        </div>

        {mode === 'in' ? (
          <>
            <div>
              <label htmlFor="packaged_date" className="block text-sm font-medium text-gray-700">
                Packaged Date (optional)
              </label>
              <input
                type="date"
                id="packaged_date"
                {...register('packaged_date')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                Purchase Price (optional)
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  id="purchase_price"
                  {...register('purchase_price', { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                {...register('quantity', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason
              </label>
              <select
                id="reason"
                {...register('reason')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              >
                {SCAN_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={2}
                {...register('notes')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                placeholder="Tasting notes, recipient name, etc."
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-md px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${
            mode === 'in'
              ? 'bg-green-600 hover:bg-green-500'
              : 'bg-red-600 hover:bg-red-500'
          }`}
        >
          {isSubmitting ? 'Processing...' : mode === 'in' ? 'Add to Inventory' : 'Remove from Inventory'}
        </button>
      </form>
    </div>
  )
}
