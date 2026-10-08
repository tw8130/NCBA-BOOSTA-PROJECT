import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { TransactionRow } from '../components/domain/TransactionRow'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useApp } from '../context/AppContext'
import type { TransactionType } from '../types'

const FILTERS: { id: TransactionType | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All activities' },
  { id: 'DISBURSEMENT', label: 'Disbursements' },
  { id: 'REPAYMENT', label: 'Full Repayments' },
  { id: 'PARTIAL_REPAYMENT', label: 'Partial Repayments' },
  { id: 'FEE', label: 'Facility Fees' },
]

export default function Transactions() {
  const { transactions, anchors, loading } = useApp()
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL')

  const filtered = filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter)

  return (
    <AppShell title="Ledger Transactions">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1 rounded-[20px] text-[11px] font-medium whitespace-nowrap border transition-colors ${
              filter === f.id
                ? 'bg-sky text-cocoa font-semibold border-sky'
                : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-sky/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          detail="Ledger activities will appear here once drawdowns or repayments occur."
        />
      ) : (
        <Card className="p-3 sm:p-4 max-w-2xl divide-y divide-surface-border dark:divide-surface-dark-border">
          {filtered.map((t) => (
            <TransactionRow key={t.id} txn={t} anchor={anchors.find((a) => a.id === t.anchorId)} />
          ))}
        </Card>
      )}
    </AppShell>
  )
}
