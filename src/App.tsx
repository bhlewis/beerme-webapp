import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ScanPage } from './pages/ScanPage'
import { InventoryPage } from './pages/InventoryPage'
import { BeersPage } from './pages/BeersPage'
import { BreweriesPage } from './pages/BreweriesPage'
import { StylesPage } from './pages/StylesPage'
import { BarcodesPage } from './pages/BarcodesPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="scan" element={<ScanPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="beers" element={<BeersPage />} />
        <Route path="breweries" element={<BreweriesPage />} />
        <Route path="styles" element={<StylesPage />} />
        <Route path="barcodes" element={<BarcodesPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
