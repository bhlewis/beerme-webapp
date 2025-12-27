import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Beer, Factory, Tag } from 'lucide-react'
import clsx from 'clsx'
import type { InventoryWithBeer } from '../../api/types'

interface SearchSuggestion {
  type: 'beer' | 'brewery' | 'style'
  value: string
  label: string
  sublabel?: string
  count: number
}

interface InventorySearchProps {
  inventory: InventoryWithBeer[]
  onFilter: (filtered: InventoryWithBeer[]) => void
  onSearchChange?: (query: string) => void
}

export function InventorySearch({ inventory, onFilter, onSearchChange }: InventorySearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Build suggestions from inventory data
  const suggestions = useMemo(() => {
    if (!query.trim() || !inventory.length) return []

    const normalizedQuery = query.toLowerCase().trim()
    const suggestionMap = new Map<string, SearchSuggestion>()

    inventory.forEach((item) => {
      // Beer names
      if (item.beer.name.toLowerCase().includes(normalizedQuery)) {
        const key = `beer:${item.beer.name}`
        if (!suggestionMap.has(key)) {
          suggestionMap.set(key, {
            type: 'beer',
            value: item.beer.name,
            label: item.beer.name,
            sublabel: item.beer.brewery.name,
            count: 1,
          })
        } else {
          suggestionMap.get(key)!.count++
        }
      }

      // Brewery names
      if (item.beer.brewery.name.toLowerCase().includes(normalizedQuery)) {
        const key = `brewery:${item.beer.brewery.name}`
        if (!suggestionMap.has(key)) {
          suggestionMap.set(key, {
            type: 'brewery',
            value: item.beer.brewery.name,
            label: item.beer.brewery.name,
            sublabel: item.beer.brewery.location ?? undefined,
            count: 1,
          })
        } else {
          suggestionMap.get(key)!.count++
        }
      }

      // Style names
      if (item.beer.style.style_name.toLowerCase().includes(normalizedQuery)) {
        const key = `style:${item.beer.style.style_name}`
        if (!suggestionMap.has(key)) {
          suggestionMap.set(key, {
            type: 'style',
            value: item.beer.style.style_name,
            label: item.beer.style.style_name,
            count: 1,
          })
        } else {
          suggestionMap.get(key)!.count++
        }
      }
    })

    // Group and sort suggestions
    const all = Array.from(suggestionMap.values())
    const beers = all.filter((s) => s.type === 'beer').slice(0, 4)
    const breweries = all.filter((s) => s.type === 'brewery').slice(0, 3)
    const styles = all.filter((s) => s.type === 'style').slice(0, 3)

    return [...beers, ...breweries, ...styles]
  }, [query, inventory])

  // Filter inventory based on query
  useEffect(() => {
    if (!query.trim()) {
      onFilter(inventory)
      return
    }

    const normalizedQuery = query.toLowerCase().trim()
    const filtered = inventory.filter(
      (item) =>
        item.beer.name.toLowerCase().includes(normalizedQuery) ||
        item.beer.brewery.name.toLowerCase().includes(normalizedQuery) ||
        item.beer.style.style_name.toLowerCase().includes(normalizedQuery)
    )
    onFilter(filtered)
  }, [query, inventory, onFilter])

  // Notify parent of search changes
  useEffect(() => {
    onSearchChange?.(query)
  }, [query, onSearchChange])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions.length) {
      if (e.key === 'Escape') {
        setQuery('')
        inputRef.current?.blur()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value)
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
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
      if (inputRef.current && !inputRef.current.closest('.search-container')?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'beer':
        return Beer
      case 'brewery':
        return Factory
      case 'style':
        return Tag
    }
  }

  const getTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'beer':
        return 'Beer'
      case 'brewery':
        return 'Brewery'
      case 'style':
        return 'Style'
    }
  }

  // Group suggestions by type for display
  const groupedSuggestions = useMemo(() => {
    const groups: { type: SearchSuggestion['type']; items: SearchSuggestion[] }[] = []
    let currentType: SearchSuggestion['type'] | null = null

    suggestions.forEach((s) => {
      if (s.type !== currentType) {
        groups.push({ type: s.type, items: [s] })
        currentType = s.type
      } else {
        groups[groups.length - 1].items.push(s)
      }
    })

    return groups
  }, [suggestions])

  // Calculate flat index for keyboard navigation
  const getFlatIndex = (groupIndex: number, itemIndex: number) => {
    let flatIndex = 0
    for (let i = 0; i < groupIndex; i++) {
      flatIndex += groupedSuggestions[i].items.length
    }
    return flatIndex + itemIndex
  }

  return (
    <div className="search-container relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search
            className={clsx(
              'h-5 w-5 transition-colors duration-200',
              query ? 'text-amber-600' : 'text-gray-400'
            )}
          />
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
          placeholder="Search beers, breweries, styles..."
          className={clsx(
            'block w-full rounded-xl border-2 bg-white py-3 pl-11 pr-10',
            'text-sm text-gray-900 placeholder-gray-400',
            'transition-all duration-200 ease-out',
            'focus:outline-none',
            isOpen && suggestions.length > 0
              ? 'border-amber-400 ring-4 ring-amber-100 rounded-b-none'
              : 'border-gray-200 hover:border-gray-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className={clsx(
            'absolute z-50 w-full overflow-hidden',
            'bg-white border-2 border-t-0 border-amber-400 rounded-b-xl',
            'shadow-lg shadow-amber-100/50',
            'animate-in fade-in slide-in-from-top-1 duration-150'
          )}
        >
          <ul ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {groupedSuggestions.map((group, groupIndex) => (
              <li key={group.type}>
                {/* Group Header */}
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50/80 sticky top-0">
                  {getTypeLabel(group.type)}s
                </div>

                {/* Group Items */}
                {group.items.map((suggestion, itemIndex) => {
                  const flatIndex = getFlatIndex(groupIndex, itemIndex)
                  const Icon = getIcon(suggestion.type)

                  return (
                    <button
                      key={`${suggestion.type}:${suggestion.value}`}
                      onClick={() => selectSuggestion(suggestion)}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                        'transition-colors duration-100',
                        activeIndex === flatIndex
                          ? 'bg-amber-50'
                          : 'hover:bg-gray-50'
                      )}
                    >
                      <div
                        className={clsx(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          'transition-colors duration-100',
                          suggestion.type === 'beer' && 'bg-amber-100 text-amber-700',
                          suggestion.type === 'brewery' && 'bg-stone-100 text-stone-600',
                          suggestion.type === 'style' && 'bg-orange-100 text-orange-600'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-medium text-gray-900 truncate"
                            dangerouslySetInnerHTML={{
                              __html: highlightMatch(suggestion.label, query)
                            }}
                          />
                          <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {suggestion.count}
                          </span>
                        </div>
                        {suggestion.sublabel && (
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.sublabel}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </li>
            ))}
          </ul>

          {/* Footer hint */}
          <div className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 bg-gray-50/50">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">↵</kbd>
              select
            </span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">esc</kbd>
              close
            </span>
          </div>
        </div>
      )}

      {/* No results state */}
      {isOpen && query.trim() && suggestions.length === 0 && (
        <div
          className={clsx(
            'absolute z-50 w-full',
            'bg-white border-2 border-t-0 border-amber-400 rounded-b-xl',
            'shadow-lg shadow-amber-100/50 p-6 text-center'
          )}
        >
          <div className="text-gray-400 mb-1">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          </div>
          <p className="text-sm text-gray-500">No matches for "<span className="font-medium text-gray-700">{query}</span>"</p>
          <p className="text-xs text-gray-400 mt-1">Try searching by beer name, brewery, or style</p>
        </div>
      )}
    </div>
  )
}

// Highlight matching text
function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return text.replace(regex, '<mark class="bg-amber-200 text-amber-900 rounded px-0.5">$1</mark>')
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
