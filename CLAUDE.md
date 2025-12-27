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
│   ├── common/    # Modal, ConfirmDialog, FreshnessIndicator, etc.
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
- `/app/inventory` - Current stock
- `/app/beers`, `/app/breweries`, `/app/styles`, `/app/barcodes` - CRUD pages
- `/app/transactions` - Activity history
- `/app/analytics` - Charts and statistics
- `/app/settings` - API configuration

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
