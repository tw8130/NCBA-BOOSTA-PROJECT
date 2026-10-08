import { ArrowDownLeft, ArrowUpRight, Receipt, ShieldAlert } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDate, formatKES } from '../../lib/format'
import { transactionStatusMeta } from '../../lib/status'
import type { Transaction, Anchor } from '../../types'

const typeMeta = {
  DISBURSEMENT: { label: 'Disbursement', icon: ArrowUpRight, color: 'text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15' },
  REPAYMENT: { label: 'Repayment', icon: ArrowDownLeft, color: 'text-mediterranean bg-mediterranean/15' },
  PARTIAL_REPAYMENT: { label: 'Partial repayment', icon: ArrowDownLeft, color: 'text-mediterranean bg-mediterranean/15' },
  FEE: { label: 'Fee', icon: Receipt, color: 'text-text-light-muted dark:text-text-dark-muted bg-black/5 dark:bg-white/10' },
  PENALTY: { label: 'Penalty', icon: ShieldAlert, color: 'text-coral bg-coral/15' },
} as const

export function TransactionRow({ txn, anchor }: { txn: Transaction; anchor?: Anchor }) {
  const meta = typeMeta[txn.type]
  const Icon = meta.icon
  const statusMeta = transactionStatusMeta[txn.status]
  return (
    <div className="flex items-center gap-3 py-3 border-b border-surface-border dark:border-surface-dark-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-cocoa dark:text-white">{meta.label}</p>
        <p className="text-xs text-text-light-muted dark:text-text-dark-muted">{anchor?.name ?? 'NCBA BOOSTA'} · {formatDate(txn.date)} · {txn.reference}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-cocoa dark:text-white">{formatKES(txn.amount)}</p>
        <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
      </div>
    </div>
  )
}
