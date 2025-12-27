import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ScanBarcode,
  Package,
  Beer,
  Factory,
  Tag,
  Barcode,
  History,
  BarChart3,
  Settings
} from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', to: '/app', icon: LayoutDashboard },
  { name: 'Scan', to: '/app/scan', icon: ScanBarcode },
  { name: 'Inventory', to: '/app/inventory', icon: Package },
  { name: 'Beers', to: '/app/beers', icon: Beer },
  { name: 'Breweries', to: '/app/breweries', icon: Factory },
  { name: 'Styles', to: '/app/styles', icon: Tag },
  { name: 'Barcodes', to: '/app/barcodes', icon: Barcode },
  { name: 'Transactions', to: '/app/transactions', icon: History },
  { name: 'Analytics', to: '/app/analytics', icon: BarChart3 },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Beer className="h-8 w-8 text-amber-500" />
        <span className="ml-2 text-xl font-bold text-white">BeerMe</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              clsx(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-2">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            clsx(
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )
          }
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
          Settings
        </NavLink>
      </div>
    </div>
  )
}
