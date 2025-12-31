import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface SearchBoxProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  isLoading?: boolean
  debounceMs?: number
  className?: string
}

export function SearchBox({
  placeholder = 'Search...',
  value: externalValue,
  onChange,
  isLoading = false,
  debounceMs = 300,
  className,
}: SearchBoxProps) {
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(externalValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Sync with external value changes (e.g., clear from parent)
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== localValue) {
      setLocalValue(externalValue)
    }
  }, [externalValue])

  // Debounced callback to parent
  const debouncedOnChange = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onChange(value)
      }, debounceMs)
    },
    [onChange, debounceMs]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedOnChange(newValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (localValue) {
        handleClear()
      } else {
        inputRef.current?.blur()
      }
    }
  }

  const isFocused = document.activeElement === inputRef.current
  const hasValue = localValue.length > 0

  return (
    <div className={clsx('search-box-container relative', className)}>
      {/* Ambient glow effect on focus */}
      <div
        className={clsx(
          'absolute -inset-1 rounded-2xl opacity-0 blur-md transition-opacity duration-500',
          'bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-amber-500/30',
          isFocused && 'opacity-100'
        )}
      />

      <div className="relative">
        {/* Search icon with animated state */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
          ) : (
            <Search
              className={clsx(
                'h-5 w-5 transition-all duration-300',
                hasValue
                  ? 'text-amber-600 scale-110'
                  : 'text-stone-400 group-focus-within:text-amber-500'
              )}
            />
          )}
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={clsx(
            // Base styles
            'peer block w-full rounded-xl py-3.5 pl-12 pr-12',
            'text-[15px] font-medium tracking-tight text-stone-800',
            'placeholder:text-stone-400 placeholder:font-normal',
            // Border & background
            'bg-white/80 backdrop-blur-sm',
            'border-2 border-stone-200/80',
            'shadow-sm shadow-stone-900/5',
            // Focus states
            'outline-none transition-all duration-300 ease-out',
            'focus:border-amber-400 focus:bg-white',
            'focus:shadow-lg focus:shadow-amber-500/10',
            // Hover state (when not focused)
            'hover:border-stone-300 hover:shadow-md hover:shadow-stone-900/5',
            'focus:hover:border-amber-400'
          )}
        />

        {/* Clear button */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="button"
            onClick={handleClear}
            className={clsx(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              'text-stone-400 transition-all duration-200',
              'hover:bg-stone-100 hover:text-stone-600',
              'active:scale-95',
              // Visibility
              hasValue
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2 pointer-events-none'
            )}
            tabIndex={hasValue ? 0 : -1}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Subtle bottom border accent */}
        <div
          className={clsx(
            'absolute bottom-0 left-4 right-4 h-0.5 rounded-full',
            'bg-gradient-to-r from-transparent via-amber-400 to-transparent',
            'transform transition-all duration-300',
            'scale-x-0 opacity-0',
            'peer-focus:scale-x-100 peer-focus:opacity-100'
          )}
        />
      </div>

      {/* Keyboard hint */}
      <div
        className={clsx(
          'absolute -bottom-6 left-0 right-0 flex justify-center',
          'text-[10px] text-stone-400 tracking-wide',
          'opacity-0 transition-opacity duration-300',
          isFocused && hasValue && 'opacity-100'
        )}
      >
        <span className="flex items-center gap-1.5">
          Press
          <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-[9px] font-mono font-medium text-stone-500 border border-stone-200">
            esc
          </kbd>
          to clear
        </span>
      </div>
    </div>
  )
}
