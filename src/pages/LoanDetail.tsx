import { useNavigate, useParams } from 'react-router-dom'
import { FileX2 } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { TransactionRow } from '../components/domain/TransactionRow'
import { formatDate, formatKES, daysUntil } from '../lib/format'
import { loanStatusMeta } from '../lib/status'
import { useApp } from '../context/AppContext'

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loans, anchors, transactions, loading } = useApp()

  if (loading) return null

  const loan = loans.find((l) => l.id === id)
  if (!loan) {
    return (
      <AppShell title="Loan" back>
        <EmptyState icon={FileX2} title="Loan not found" detail="This loan reference could not be located." />
      </AppShell>
    )
  }

  const anchor = anchors.find((a) => a.id === loan.anchorId)
  const meta = loanStatusMeta[loan.status]
  const paid = loan.principal - loan.outstandingBalance
  const paidPct = loan.principal > 0 ? Math.round((paid / loan.principal) * 100) : 0
  const days = daysUntil(loan.dueDate)
  const loanTxns = transactions.filter((t) => t.loanId === loan.id)

  return (
    <AppShell title={loan.reference} back>
      <div className="max-w-md space-y-4">
        <Card className="p-5 text-center">
          <StatusBadge label={meta.label} tone={meta.tone} />
          <p className="text-3xl font-bold text-cocoa dark:text-white mt-2">{formatKES(loan.outstandingBalance)}</p>
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted">outstanding of {formatKES(loan.principal)} · {anchor?.name}</p>

          <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mt-4">
            <div className="h-full bg-mediterranean rounded-full" style={{ width: `${paidPct}%` }} />
          </div>
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-1">{paidPct}% repaid</p>
        </Card>

        <Card className="p-4">
          <div className="space-y-2 text-sm">
            <Row label="Amount borrowed" value={formatKES(loan.principal)} />
            <Row label="Amount paid" value={formatKES(paid)} />
            <Row label="Outstanding balance" value={formatKES(loan.outstandingBalance)} />
            <Row label="Disbursed" value={formatDate(loan.disbursedAt)} />
            <Row
              label="Due date"
              value={`${formatDate(loan.dueDate)}${loan.status === 'ACTIVE' && days >= 0 ? ` (${days}d left)` : ''}`}
            />
          </div>
        </Card>

        {loan.status !== 'PAID' && (
          <Button full onClick={() => navigate(`/customer/repay?loan=${loan.id}`)}>Repay this loan</Button>
        )}

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-1">Transaction history</p>
          {loanTxns.length === 0 ? (
            <p className="text-sm text-text-light-muted dark:text-text-dark-muted py-2">No transactions yet for this loan.</p>
          ) : (
            loanTxns.map((t) => <TransactionRow key={t.id} txn={t} anchor={anchor} />)
          )}
        </Card>
      </div>
    </AppShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-light-muted dark:text-text-dark-muted">{label}</span>
      <span className="font-medium text-cocoa dark:text-white text-right">{value}</span>
    </div>
  )
}
