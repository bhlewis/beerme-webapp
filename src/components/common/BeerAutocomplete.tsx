import { useState, useRef, useEffect, useMemo } from 'react'
import { Beer, Factory, ChevronDown, Check, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useBeers } from '../../hooks/useBeers'
import type { BeerWithDetails } from '../../api/types'

interface BeerAutocompleteProps {
  value: number | null
  onChange: (beerId: number | null, beer: BeerWithDetails | null) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

export function BeerAutocomplete({
  value,
  onChange,
  placeholder = 'Search for a beer...',
  disabled = false,
  error = false,
}: BeerAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: beers, isLoading } = useBeers()

  // Find selected beer
  const selectedBeer = useMemo(() => {
    if (!value || !beers) return null
    return beers.find((b) => b.id === value) ?? null
  }, [value, beers])

  // Filter beers based on query
  const filteredBeers = useMemo(() => {
    if (!beers) return []
    if (!query.trim()) return beers.slice(0, 50) // Limit initial display

    const normalizedQuery = query.toLowerCase().trim()
    return beers.filter(
      (beer) =>
        beer.name.toLowerCase().includes(normalizedQuery) ||
        beer.brewery.name.toLowerCase().includes(normalizedQuery) ||
        beer.style.style_name.toLowerCase().includes(normalizedQuery)
    ).slice(0, 20)
  }, [beers, query])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < filteredBeers.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredBeers.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && filteredBeers[activeIndex]) {
          selectBeer(filteredBeers[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const selectBeer = (beer: BeerWithDetails) => {
    onChange(beer.id, beer)
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[activeIndex] as HTMLElement
      activeItem?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset query when selection changes externally
  useEffect(() => {
    if (!value) {
      setQuery('')
    }
  }, [value])

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Beer Display / Input */}
      {selectedBeer && !isOpen ? (
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen(true)
              setTimeout(() => inputRef.current?.focus(), 0)
            }
          }}
          disabled={disabled}
          className={clsx(
            'w-full flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left',
            'transition-all duration-200',
            disabled
              ? 'cursor-not-allowed bg-gray-50 border-gray-200'
              : 'cursor-pointer hover:border-amber-300',
            error ? 'border-red-300' : 'border-gray-200'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
            <Beer className="h-5 w-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{selectedBeer.name}</div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="truncate">{selectedBeer.brewery.name}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 truncate">
                {selectedBeer.style.style_name}
              </span>
            </div>
          </div>
          {!disabled && (
            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}
        </button>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            ) : (
              <Beer className={clsx(
                'h-5 w-5 transition-colors duration-200',
                isOpen ? 'text-amber-600' : 'text-gray-400'
              )} />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              setActiveIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              'block w-full rounded-xl border-2 bg-white py-3 pl-11 pr-10',
              'text-sm text-gray-900 placeholder-gray-400',
              'transition-all duration-200 ease-out',
              'focus:outline-none',
              disabled && 'cursor-not-allowed bg-gray-50',
              error
                ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                : isOpen
                  ? 'border-amber-400 ring-4 ring-amber-100'
                  : 'border-gray-200 hover:border-gray-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'
            )}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className={clsx(
              'h-5 w-5 text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-2 w-full overflow-hidden',
            'bg-white border-2 border-amber-200 rounded-xl',
            'shadow-xl shadow-amber-100/50',
            'animate-in fade-in slide-in-from-top-1 duration-150'
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading beers...</span>
            </div>
          ) : filteredBeers.length > 0 ? (
            <ul ref={listRef} className="max-h-64 overflow-y-auto py-2">
              {filteredBeers.map((beer, index) => (
                <li key={beer.id}>
                  <button
                    type="button"
                    onClick={() => selectBeer(beer)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left',
                      'transition-colors duration-100',
                      activeIndex === index
                        ? 'bg-amber-50'
                        : 'hover:bg-gray-50',
                      value === beer.id && 'bg-amber-50/50'
                    )}
                  >
                    <div className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0',
                      'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100'
                    )}>
                      <Beer className="h-4 w-4 text-amber-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {highlightMatch(beer.name, query)}
                        </span>
                        {beer.abv && (
                          <span className="flex-shrink-0 text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            {beer.abv}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Factory className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">
                          {highlightMatch(beer.brewery.name, query)}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-stone-500 truncate">
                          {highlightMatch(beer.style.style_name, query)}
                        </span>
                      </div>
                    </div>

                    {value === beer.id && (
                      <Check className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <Beer className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No beers found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}

          {/* Quick stats footer */}
          {!isLoading && filteredBeers.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/50">
              <p className="text-[11px] text-gray-400">
                {query ? (
                  <>Showing {filteredBeers.length} result{filteredBeers.length !== 1 && 's'}</>
                ) : (
                  <>{beers?.length ?? 0} beers available</>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
