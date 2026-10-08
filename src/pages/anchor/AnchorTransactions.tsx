import { useState } from 'react'
import { Receipt, Search } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatDate, formatKES } from '../../lib/format'
import { transactionStatusMeta } from '../../lib/status'
import { useAnchorPortal } from '../../context/AnchorContext'
import type { AnchorTransaction } from '../../types'

const TYPES: { id: AnchorTransaction['type'] | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'DISBURSEMENT', label: 'Disbursements' },
  { id: 'REPAYMENT', label: 'Repayments' },
  { id: 'FEES', label: 'Fees' },
  { id: 'COLLECTIONS', label: 'Collections' },
  { id: 'SETTLEMENT', label: 'Settlement' },
]

export default function AnchorTransactions() {
  const { transactions, loading } = useAnchorPortal()
  const [type, setType] = useState<AnchorTransaction['type'] | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const filtered = transactions
    .filter((t) => type === 'ALL' || t.type === type)
    .filter((t) => !search || t.reference.toLowerCase().includes(search.toLowerCase()) || t.customerName?.toLowerCase().includes(search.toLowerCase()))

  return (
    <AnchorShell title="NCBA Transactions">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-2 overflow-x-auto">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold whitespace-nowrap border transition-colors ${
                type === t.id
                  ? 'bg-sky text-cocoa border-sky'
                  : 'bg-surface-light dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-light-muted dark:text-text-dark-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or customer"
            className="pl-7 pr-3 py-1.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white text-xs w-56 focus:outline-none focus:border-sky"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions" detail="Nothing matches this filter yet." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="py-2.5 px-4 font-medium">Date</th>
                  <th className="py-2.5 px-4 font-medium">Type</th>
                  <th className="py-2.5 px-4 font-medium">Customer</th>
                  <th className="py-2.5 px-4 font-medium">Reference</th>
                  <th className="py-2.5 px-4 font-medium">Amount</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const meta = transactionStatusMeta[t.status]
                  return (
                    <tr key={t.id} className="border-b border-surface-border dark:border-surface-dark-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs">{formatDate(t.date)}</td>
                      <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs capitalize">{t.type.toLowerCase()}</td>
                      <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs">{t.customerName ?? '—'}</td>
                      <td className="py-2.5 px-4 text-text-light-muted dark:text-text-dark-muted text-xs">{t.reference}</td>
                      <td className="py-2.5 px-4 font-semibold text-cocoa dark:text-white text-xs">{formatKES(t.amount)}</td>
                      <td className="py-2.5 px-4"><StatusBadge label={meta.label} tone={meta.tone} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AnchorShell>
  )
}
