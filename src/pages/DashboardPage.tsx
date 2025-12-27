import { Link } from 'react-router-dom'
import { Package, AlertTriangle, TrendingUp, ScanBarcode } from 'lucide-react'
import { useInventory, useStaleInventory } from '../hooks/useInventory'
import { useTransactions } from '../hooks/useTransactions'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { FreshnessIndicator } from '../components/common/FreshnessIndicator'
import { formatDateTime } from '../utils/formatters'

export function DashboardPage() {
  const { data: inventory, isLoading: inventoryLoading } = useInventory({ in_stock_only: true })
  const { data: staleInventory, isLoading: staleLoading } = useStaleInventory()
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 })

  const totalBeers = inventory?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const uniqueBeers = inventory?.length ?? 0
  const staleCount = staleInventory?.length ?? 0

  if (inventoryLoading || staleLoading || transactionsLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/app/scan"
          className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          <ScanBarcode className="mr-2 h-5 w-5" />
          Scan Beer
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Beers</p>
              <p className="text-2xl font-semibold text-gray-900">{totalBeers}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Unique Beers</p>
              <p className="text-2xl font-semibold text-gray-900">{uniqueBeers}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className={`h-8 w-8 ${staleCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Stale Beers</p>
              <p className={`text-2xl font-semibold ${staleCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {staleCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stale Warnings */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Stale Warnings</h3>
            <p className="mt-1 text-sm text-gray-500">Beers past their freshness threshold</p>
          </div>
          <div className="border-t border-gray-200">
            {staleInventory && staleInventory.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {staleInventory.slice(0, 5).map((item) => (
                  <li key={item.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.beer.name}</p>
                        <p className="text-sm text-gray-500">{item.beer.brewery.name}</p>
                      </div>
                      <FreshnessIndicator daysOld={item.days_old} styleName={item.beer.style.style_name} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-gray-500">No stale beers</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
            <p className="mt-1 text-sm text-gray-500">Latest inventory changes</p>
          </div>
          <div className="border-t border-gray-200">
            {transactions && transactions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <li key={tx.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            tx.transaction_type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tx.transaction_type === 'IN' ? '+' : ''}{tx.quantity_change}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">{tx.reason_name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{formatDateTime(tx.created_at)}</span>
                    </div>
                    {tx.notes && <p className="mt-1 text-sm text-gray-500">{tx.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-gray-500">No recent transactions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
