import clsx from 'clsx'
import { getFreshnessStatus, getFreshnessColor, type FreshnessStatus } from '../../utils/freshness'

interface FreshnessIndicatorProps {
  daysOld: number | null
  styleName: string | null
  showDays?: boolean
}

export function FreshnessIndicator({ daysOld, styleName, showDays = true }: FreshnessIndicatorProps) {
  const status: FreshnessStatus = getFreshnessStatus(daysOld, styleName)
  const colorClass = getFreshnessColor(status)

  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colorClass)}>
      {status}
      {showDays && daysOld !== null && (
        <span className="ml-1 opacity-75">({daysOld}d)</span>
      )}
    </span>
  )
}
