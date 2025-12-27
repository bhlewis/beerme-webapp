import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { formatDateTime } from '../utils/formatters'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import type { TransactionsParams } from '../api/types'

export function TransactionsPage() {
  const [params, setParams] = useState<TransactionsParams>({
    limit: 100,
    order_by: 'created_at',
    order_dir: 'desc',
  })

  const { data: transactions, isLoading } = useTransactions(params)

  if (isLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-2">
          <select
            value={params.transaction_type || ''}
            onChange={(e) => setParams((prev) => ({
              ...prev,
              transaction_type: e.target.value as 'IN' | 'OUT' | undefined || undefined,
            }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="IN">Scan In</option>
            <option value="OUT">Scan Out</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {transactions?.map((tx) => (
              <tr key={tx.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tx.transaction_type === 'IN'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.transaction_type === 'IN' ? (
                      <ArrowDownCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowUpCircle className="mr-1 h-3 w-3" />
                    )}
                    {tx.transaction_type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{tx.reason_name}</td>
                <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">{tx.notes || '-'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDateTime(tx.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions?.length === 0 && <p className="py-8 text-center text-gray-500">No transactions found</p>}
      </div>
    </div>
  )
}
