// Matches the Pydantic schemas from beerme-api

export interface Brewery {
  id: number
  name: string
  location: string | null
  category: string | null
  website: string | null
}

export interface BreweryCreate {
  name: string
  location?: string
  category?: string
  website?: string
}

export interface BreweryUpdate {
  name?: string
  location?: string
  category?: string
  website?: string
}

export interface Style {
  id: number
  style_name: string
}

export interface StyleCreate {
  style_name: string
}

export interface StyleUpdate {
  style_name?: string
}

export interface Beer {
  id: number
  brewery_id: number
  style_id: number
  name: string
  abv: number | null
  ibu: number | null
}

export interface BeerWithDetails {
  id: number
  name: string
  abv: number | null
  ibu: number | null
  brewery: Brewery
  style: Style
}

export interface BeerCreate {
  brewery_id: number
  style_id: number
  name: string
  abv?: number
  ibu?: number
}

export interface BeerUpdate {
  brewery_id?: number
  style_id?: number
  name?: string
  abv?: number
  ibu?: number
}

export interface Barcode {
  upc_code: string
  beer_id: number
  container_type: string
  unit_count: number
}

export interface BarcodeWithBeer {
  upc_code: string
  beer_id: number
  container_type: string
  unit_count: number
  beer: BeerWithDetails
}

export interface BarcodeCreate {
  upc_code: string
  beer_id: number
  container_type: string
  unit_count?: number
}

export interface BarcodeUpdate {
  beer_id?: number
  container_type?: string
  unit_count?: number
}

export interface InventoryResponse {
  id: number
  beer_id: number
  quantity: number
  packaged_date: string | null
  purchase_price: number | null
  added_at: string
}

export interface InventoryWithBeer {
  id: number
  quantity: number
  packaged_date: string | null
  purchase_price: number | null
  added_at: string
  beer: BeerWithDetails
  days_old: number | null
}

export interface ScanIn {
  upc_code: string
  packaged_date?: string
  purchase_price?: number
}

export interface ScanOut {
  upc_code: string
  quantity?: number
  reason?: string
  notes?: string
}

export interface Transaction {
  id: number
  inventory_id: number
  transaction_type: 'IN' | 'OUT'
  reason_name: string
  quantity_change: number
  created_at: string
  notes: string | null
}

// Query parameters
export interface PaginationParams {
  order_by?: string
  order_dir?: 'asc' | 'desc'
}

export interface InventoryParams extends PaginationParams {
  in_stock_only?: boolean
}

export interface BeersParams extends PaginationParams {
  name?: string
  brewery?: string
  location?: string
  brewery_id?: number
  style_id?: number
}

export interface BreweriesParams extends PaginationParams {
  name?: string
  location?: string
  category?: string
}

export interface StylesParams extends PaginationParams {
  name?: string
}

export interface BarcodesParams extends PaginationParams {
  beer_name?: string
  brewery_name?: string
  beer_id?: number
  brewery_id?: number
}

export interface TransactionsParams extends PaginationParams {
  limit?: number
  transaction_type?: 'IN' | 'OUT'
}
