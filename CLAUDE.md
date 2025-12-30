# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BeerMe Webapp is a React-based dashboard for managing beer fridge inventory. It consumes the REST API from the `beerme-api` project located at `/home/bhlewis/src/beerme-api`.

## Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query v5 + Axios
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Directory Structure
```
src/
├── api/           # API client and service modules
│   ├── client.ts  # Axios instance with X-API-Key interceptor
│   └── types.ts   # TypeScript interfaces matching API schemas
├── components/    # Reusable UI components
│   ├── common/    # Modal, ConfirmDialog, FreshnessIndicator, InventorySearch, BeerAutocomplete
│   ├── inventory/ # InventoryFormModal for add/edit functionality
│   └── layout/    # AppLayout, Sidebar
├── context/       # React Context (ApiKeyContext)
├── hooks/         # Custom hooks wrapping TanStack Query
├── pages/         # Route page components
└── utils/         # Helpers (freshness.ts, formatters.ts)
```

### Routes
All routes are prefixed with `/app`:
- `/app` - Dashboard
- `/app/scan` - Barcode scan in/out
- `/app/inventory` - Current stock with search, add, edit, delete
- `/app/beers`, `/app/breweries`, `/app/styles`, `/app/barcodes` - CRUD pages
- `/app/transactions` - Activity history
- `/app/analytics` - Charts and statistics
- `/app/settings` - API configuration

### Key Components

#### InventorySearch (`components/common/InventorySearch.tsx`)
Autocomplete search box for filtering inventory by beer name, brewery, or style. Features:
- Categorized suggestions (Beers, Breweries, Styles)
- Keyboard navigation (arrows, enter, escape)
- Real-time client-side filtering

#### BeerAutocomplete (`components/common/BeerAutocomplete.tsx`)
Beer selection component with autocomplete. Used in inventory forms for selecting beers. Features:
- Search by name, brewery, or style
- Shows ABV, brewery, and style for each suggestion
- Keyboard navigation support

#### InventoryFormModal (`components/inventory/InventoryFormModal.tsx`)
Modal dialog for adding/editing inventory items. Fields:
- Beer (autocomplete)
- Quantity
- Packaged date
- Purchase price

### API Integration
- API key stored in localStorage (`beerme_api_key`)
- API URL configurable via Settings page (defaults to `http://localhost:8000`)
- All requests include `X-API-Key` header via Axios interceptor
- Types in `src/api/types.ts` mirror the Pydantic schemas from beerme-api

### Freshness Logic
The `src/utils/freshness.ts` mirrors the backend's FreshnessService:
- Hop-forward styles (IPA, Pale Ale, etc.): 90-day threshold
- Other styles: 365-day threshold
- Status levels: Fresh, Good, Drink Soon, Past Prime, Aged

### State Management
- Server state managed via TanStack Query with automatic caching/refetching
- API credentials managed via ApiKeyContext
- No additional state management library needed
