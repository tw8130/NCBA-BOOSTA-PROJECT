import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDate, formatKES, daysUntil } from '../../lib/format'
import { loanStatusMeta } from '../../lib/status'
import type { Loan, Anchor } from '../../types'

export function LoanCard({
  loan,
  anchor,
  onClick,
}: {
  loan: Loan
  anchor?: Anchor
  onClick?: () => void
}) {
  const navigate = useNavigate()
  const meta = loanStatusMeta[loan.status]
  const days = daysUntil(loan.dueDate)

  // Compute tenor elapsed progress
  const disbursedTime = new Date(loan.disbursedAt).getTime()
  const dueTime = new Date(loan.dueDate).getTime()
  const totalDuration = Math.max(1, dueTime - disbursedTime)
  const elapsed = Math.max(0, Date.now() - disbursedTime)
  const elapsedPct = Math.min(100, Math.round((elapsed / totalDuration) * 100))

  return (
    <Card
      className={`p-4 transition-colors ${onClick ? 'cursor-pointer hover:border-sky/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted font-medium">
            {anchor?.name ?? 'Anchor'} · <span className="font-mono">{loan.reference}</span>
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-cocoa dark:text-white">
              {formatKES(loan.outstandingBalance)}
            </span>
            <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
              of {formatKES(loan.principal)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={meta.label} tone={meta.tone} />
          {loan.status === 'ACTIVE' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/customer/repay?loanId=${loan.id}`)
              }}
              className="px-2.5 py-1 rounded-[4px] bg-sky text-cocoa text-[11px] font-semibold hover:bg-sky-hover transition-colors"
            >
              Repay
            </button>
          )}
        </div>
      </div>

      {/* Tenor Progress Bar */}
      {loan.status === 'ACTIVE' && (
        <div className="my-2.5">
          <div className="flex items-center justify-between text-[10px] text-text-light-muted dark:text-text-dark-muted mb-1">
            <span>Disbursed: {formatDate(loan.disbursedAt)}</span>
            <span className={days <= 3 ? 'text-coral font-bold' : 'font-medium text-cocoa dark:text-white'}>
              {days < 0 ? 'Overdue' : `${days} days remaining`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                days <= 3 ? 'bg-coral' : 'bg-sky'
              }`}
              style={{ width: `${elapsedPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-text-light-muted dark:text-text-dark-muted pt-2 border-t border-surface-border dark:border-surface-dark-border">
        <span>Anchor Account: {anchor?.collectionAccountNumber || 'NCBA Core'}</span>
        <span
          className={`font-semibold ${
            loan.status === 'ACTIVE' && days <= 3
              ? 'text-coral dark:text-sun'
              : 'text-cocoa dark:text-white'
          }`}
        >
          Due {formatDate(loan.dueDate)}
        </span>
      </div>
    </Card>
  )
}
