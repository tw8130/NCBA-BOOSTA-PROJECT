import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { LoanCard } from '../components/domain/LoanCard'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import type { LoanStatus } from '../types'

const FILTERS: { id: LoanStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All facilities' },
  { id: 'ACTIVE', label: 'Active loans' },
  { id: 'OVERDUE', label: 'Overdue loans' },
  { id: 'PAID', label: 'Paid off' },
]

export default function Loans() {
  const navigate = useNavigate()
  const { loans, anchors, loading } = useApp()
  const [filter, setFilter] = useState<LoanStatus | 'ALL'>('ALL')

  const filtered = filter === 'ALL' ? loans : loans.filter((l) => l.status === filter)

  return (
    <AppShell title="My Loans">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary">
          Every drawdown functions as an independent loan record with its own tenor and schedule.
        </p>
        <Button size="sm" onClick={() => navigate('/customer/drawdown')}>
          New drawdown
        </Button>
      </div>

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
          icon={Wallet}
          title="No loans in this category"
          detail="Loans matching this filter will appear here with balance and repayment controls."
        />
      ) : (
        <div className="space-y-3 max-w-2xl">
          {filtered.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              anchor={anchors.find((a) => a.id === loan.anchorId)}
              onClick={() => navigate(`/customer/loans/${loan.id}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}
