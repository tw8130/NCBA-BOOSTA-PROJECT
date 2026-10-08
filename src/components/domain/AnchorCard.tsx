import { ChevronRight, AlertCircle } from 'lucide-react'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'
import { formatKES } from '../../lib/format'
import type { Anchor } from '../../types'

export function AnchorCard({
  anchor,
  activeLoanCount = 0,
  onClick,
  selectable = false,
  selected = false,
}: {
  anchor: Anchor
  activeLoanCount?: number
  onClick?: () => void
  selectable?: boolean
  selected?: boolean
}) {
  const used = anchor.approvedLimit - anchor.availableLimit
  const usagePct = anchor.approvedLimit > 0 ? Math.round((used / anchor.approvedLimit) * 100) : 0

  return (
    <Card
      className={`p-4 transition-colors ${onClick ? 'cursor-pointer hover:border-sky/50' : ''} ${selected ? 'border-sky ring-1 ring-sky bg-sky-tint/20 dark:bg-sky/5' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky font-bold flex items-center justify-center shrink-0">
          {anchor.logoInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-cocoa dark:text-white truncate">{anchor.name}</p>
            {anchor.type === 'SUB_ANCHOR' && <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted uppercase tracking-wide">Sub-anchor</span>}
          </div>
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted">
            {activeLoanCount > 0 ? `${activeLoanCount} active loan${activeLoanCount > 1 ? 's' : ''}` : 'No active loans'}
          </p>
        </div>
        {selectable ? (
          <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${selected ? 'border-sky bg-sky' : 'border-surface-border dark:border-surface-dark-border'}`} />
        ) : (
          onClick && <ChevronRight size={18} className="text-text-light-muted dark:text-text-dark-muted shrink-0" />
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
        <div>
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">Available</p>
          <p className="font-bold text-cocoa dark:text-white">{formatKES(anchor.availableLimit)}</p>
        </div>
        <StatusBadge
          label={anchor.drawdownAllowed ? 'Drawdown available' : 'Drawdown unavailable'}
          tone={anchor.drawdownAllowed ? 'success' : 'warning'}
        />
      </div>

      {!anchor.drawdownAllowed && (
        <div className="mt-2 flex items-start gap-1.5 text-cocoa dark:text-white text-xs bg-sun/15 border border-sun/30 rounded-[4px] px-2.5 py-2">
          <AlertCircle size={13} className="mt-0.5 shrink-0 text-cocoa dark:text-sun" />
          <span>Limit of {formatKES(anchor.approvedLimit)} is still valid — drawdown is on hold pending a credit-reference check.</span>
        </div>
      )}

      <div className="mt-3">
        <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-sky rounded-full" style={{ width: `${usagePct}%` }} />
        </div>
        <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-1">{usagePct}% of {formatKES(anchor.approvedLimit)} used</p>
      </div>
    </Card>
  )
}
