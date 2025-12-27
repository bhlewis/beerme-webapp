// Mirrors the backend FreshnessService logic

const HOP_FORWARD_STYLES = [
  'IPA',
  'DIPA',
  'Double IPA',
  'Triple IPA',
  'NEIPA',
  'New England IPA',
  'Hazy IPA',
  'West Coast IPA',
  'Pale Ale',
  'American Pale Ale',
]

export function isHopForwardStyle(styleName: string | null): boolean {
  if (!styleName) return false
  const styleUpper = styleName.toUpperCase()
  return HOP_FORWARD_STYLES.some(s => styleUpper.includes(s.toUpperCase()))
}

export type FreshnessStatus = 'Fresh' | 'Good' | 'Drink Soon' | 'Past Prime' | 'Aged' | 'Unknown'

export function getFreshnessStatus(daysOld: number | null, styleName: string | null): FreshnessStatus {
  if (daysOld === null) return 'Unknown'

  const isHopForward = isHopForwardStyle(styleName)

  if (isHopForward) {
    if (daysOld <= 30) return 'Fresh'
    if (daysOld <= 60) return 'Good'
    if (daysOld <= 90) return 'Drink Soon'
    return 'Past Prime'
  } else {
    if (daysOld <= 180) return 'Fresh'
    if (daysOld <= 365) return 'Good'
    return 'Aged'
  }
}

export function getFreshnessColor(status: FreshnessStatus): string {
  const colors: Record<FreshnessStatus, string> = {
    'Fresh': 'bg-green-100 text-green-800',
    'Good': 'bg-blue-100 text-blue-800',
    'Drink Soon': 'bg-yellow-100 text-yellow-800',
    'Past Prime': 'bg-red-100 text-red-800',
    'Aged': 'bg-gray-100 text-gray-800',
    'Unknown': 'bg-gray-50 text-gray-500',
  }
  return colors[status]
}
