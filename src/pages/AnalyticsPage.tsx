import { useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useInventory } from '../hooks/useInventory'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { format, parseISO, startOfWeek, subWeeks } from 'date-fns'

const COLORS = ['#d97706', '#0284c7', '#16a34a', '#dc2626', '#9333ea', '#0891b2', '#ca8a04', '#4f46e5']

export function AnalyticsPage() {
  const { data: transactions, isLoading: txLoading } = useTransactions({ limit: 500 })
  const { data: inventory, isLoading: invLoading } = useInventory({ in_stock_only: true })

  const consumptionByWeek = useMemo(() => {
    if (!transactions) return []
    const outTx = transactions.filter((tx) => tx.transaction_type === 'OUT')
    const weeks: Record<string, number> = {}

    // Get last 12 weeks
    for (let i = 0; i < 12; i++) {
      const weekStart = startOfWeek(subWeeks(new Date(), i))
      const weekKey = format(weekStart, 'MMM d')
      weeks[weekKey] = 0
    }

    outTx.forEach((tx) => {
      const weekStart = startOfWeek(parseISO(tx.created_at))
      const weekKey = format(weekStart, 'MMM d')
      if (weekKey in weeks) {
        weeks[weekKey] += Math.abs(tx.quantity_change)
      }
    })

    return Object.entries(weeks)
      .map(([week, count]) => ({ week, consumed: count }))
      .reverse()
  }, [transactions])

  const styleBreakdown = useMemo(() => {
    if (!inventory) return []
    const styles: Record<string, number> = {}

    inventory.forEach((item) => {
      const styleName = item.beer.style.style_name
      styles[styleName] = (styles[styleName] || 0) + item.quantity
    })

    return Object.entries(styles)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [inventory])

  const breweryBreakdown = useMemo(() => {
    if (!inventory) return []
    const breweries: Record<string, number> = {}

    inventory.forEach((item) => {
      const breweryName = item.beer.brewery.name
      breweries[breweryName] = (breweries[breweryName] || 0) + item.quantity
    })

    return Object.entries(breweries)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [inventory])

  const stats = useMemo(() => {
    if (!transactions) return { totalConsumed: 0, avgPerWeek: 0 }
    const outTx = transactions.filter((tx) => tx.transaction_type === 'OUT')
    const totalConsumed = outTx.reduce((sum, tx) => sum + Math.abs(tx.quantity_change), 0)
    const avgPerWeek = totalConsumed / 12

    return { totalConsumed, avgPerWeek: Math.round(avgPerWeek * 10) / 10 }
  }, [transactions])

  if (txLoading || invLoading) {
    return <LoadingSpinner size="lg" className="mt-20" />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <p className="text-sm font-medium text-gray-500">Total Consumed (12 weeks)</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalConsumed}</p>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <p className="text-sm font-medium text-gray-500">Avg Per Week</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgPerWeek}</p>
        </div>
      </div>

      {/* Consumption Over Time */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-900">Consumption Over Time</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={consumptionByWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="consumed" stroke="#d97706" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Style Breakdown */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900">Inventory by Style</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={styleBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {styleBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brewery Breakdown */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900">Inventory by Brewery</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breweryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
