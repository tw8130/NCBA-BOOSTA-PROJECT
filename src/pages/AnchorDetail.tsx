import { useNavigate, useParams } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { LoanCard } from '../components/domain/LoanCard'
import { TransactionRow } from '../components/domain/TransactionRow'
import { formatKES } from '../lib/format'
import { useApp } from '../context/AppContext'

export default function AnchorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { anchors, loans, transactions, loading } = useApp()

  if (loading) return null

  const anchor = anchors.find((a) => a.id === id)
  if (!anchor) {
    return (
      <AppShell title="Anchor" back>
        <EmptyState icon={Wallet} title="Anchor not found" detail="This anchor could not be located." />
      </AppShell>
    )
  }

  const anchorLoans = loans.filter((l) => l.anchorId === id)
  const activeLoans = anchorLoans.filter((l) => l.status === 'ACTIVE')
  const totalRepaid = anchorLoans.reduce((s, l) => s + (l.principal - l.outstandingBalance), 0)
  const used = anchor.approvedLimit - anchor.availableLimit
  const anchorTxns = transactions.filter((t) => t.anchorId === id).slice(0, 5)

  return (
    <AppShell title={anchor.name} back>
      <div className="max-w-xl space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky font-bold flex items-center justify-center text-lg">
              {anchor.logoInitial}
            </div>
            <div>
              <p className="font-bold text-cocoa dark:text-white">{anchor.name}</p>
              <p className="text-xs text-text-light-muted dark:text-text-dark-muted">{anchor.type === 'ANCHOR' ? 'Anchor' : 'Sub-anchor'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Approved limit" value={formatKES(anchor.approvedLimit)} />
            <Stat label="Available limit" value={formatKES(anchor.availableLimit)} />
            <Stat label="Used limit" value={formatKES(used)} />
            <Stat label="Total repaid" value={formatKES(totalRepaid)} />
          </div>
          <Button
            full
            className="mt-4"
            disabled={!anchor.drawdownAllowed}
            onClick={() => navigate(`/customer/drawdown?anchor=${anchor.id}`)}
          >
            {anchor.drawdownAllowed ? 'Draw down' : 'Drawdown unavailable'}
          </Button>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Active loans ({activeLoans.length})</p>
          {activeLoans.length === 0 ? (
            <p className="text-sm text-text-light-muted dark:text-text-dark-muted">No active loans with {anchor.name}.</p>
          ) : (
            <div className="space-y-2">
              {activeLoans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} anchor={anchor} onClick={() => navigate(`/customer/loans/${loan.id}`)} />
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-1">Recent transactions</p>
          {anchorTxns.length === 0 ? (
            <p className="text-sm text-text-light-muted dark:text-text-dark-muted py-2">No transactions yet.</p>
          ) : (
            anchorTxns.map((t) => <TransactionRow key={t.id} txn={t} anchor={anchor} />)
          )}
        </Card>
      </div>
    </AppShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">{label}</p>
      <p className="font-bold text-cocoa dark:text-white">{value}</p>
    </div>
  )
}
