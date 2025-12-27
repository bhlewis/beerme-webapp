import { format, parseISO } from 'date-fns'

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function formatAbv(abv: number | null): string {
  if (abv === null) return '-'
  return `${abv}%`
}

export function formatIbu(ibu: number | null): string {
  if (ibu === null) return '-'
  return `${ibu} IBU`
}
