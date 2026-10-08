import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDate, formatKES, daysUntil } from '../../lib/format'
import { loanStatusMeta } from '../../lib/status'
import type { Loan, Anchor } from '../../types'

export function LoanCard({ loan, anchor, onClick }: { loan: Loan; anchor?: Anchor; onClick?: () => void }) {
  const meta = loanStatusMeta[loan.status]
  const days = daysUntil(loan.dueDate)
  return (
    <Card className={`p-4 transition-colors ${onClick ? 'cursor-pointer hover:border-sky/50' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted">{anchor?.name ?? 'Anchor'} · {loan.reference}</p>
          <p className="text-2xl font-bold text-cocoa dark:text-white">{formatKES(loan.outstandingBalance)}</p>
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted">of {formatKES(loan.principal)} borrowed</p>
        </div>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>
      <div className="flex items-center justify-between text-xs text-text-light-muted dark:text-text-dark-muted pt-3 border-t border-surface-border dark:border-surface-dark-border">
        <span>Disbursed {formatDate(loan.disbursedAt)}</span>
        <span className={`font-medium ${loan.status === 'ACTIVE' && days <= 3 ? 'text-cocoa dark:text-sun font-semibold' : 'text-cocoa dark:text-white'}`}>
          Due {formatDate(loan.dueDate)}{loan.status === 'ACTIVE' && days >= 0 ? ` · ${days}d left` : ''}
        </span>
      </div>
    </Card>
  )
}
