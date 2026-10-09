import { ArrowDownLeft, ArrowUpRight, Receipt, ShieldAlert } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDate, formatKES } from '../../lib/format'
import { transactionStatusMeta } from '../../lib/status'
import type { Transaction, Anchor } from '../../types'

const typeMeta = {
  DISBURSEMENT: {
    label: 'Disbursement',
    icon: ArrowUpRight,
    color: 'text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15',
    prefix: '',
  },
  REPAYMENT: {
    label: 'Repayment',
    icon: ArrowDownLeft,
    color: 'text-mediterranean bg-mediterranean/15',
    prefix: '+',
  },
  PARTIAL_REPAYMENT: {
    label: 'Partial Repayment',
    icon: ArrowDownLeft,
    color: 'text-mediterranean bg-mediterranean/15',
    prefix: '+',
  },
  FEE: {
    label: 'Facility Fee',
    icon: Receipt,
    color: 'text-text-light-muted dark:text-text-dark-muted bg-black/5 dark:bg-white/10',
    prefix: '-',
  },
  PENALTY: {
    label: 'Penalty',
    icon: ShieldAlert,
    color: 'text-coral bg-coral/15',
    prefix: '-',
  },
} as const

export function TransactionRow({
  txn,
  anchor,
  onClick,
}: {
  txn: Transaction
  anchor?: Anchor
  onClick?: () => void
}) {
  const meta = typeMeta[txn.type]
  const Icon = meta.icon
  const statusMeta = transactionStatusMeta[txn.status]

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 py-3 border-b border-surface-border dark:border-surface-dark-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-cocoa dark:text-white leading-tight">
            {meta.label}
          </p>
          {txn.ftxReference && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky/15 text-cocoa dark:text-sky border border-sky/30">
              {txn.ftxReference}
            </span>
          )}
        </div>

        <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-0.5 truncate">
          {anchor?.name ?? 'NCBA BOOSTA'} · {formatDate(txn.date)} · <span className="font-mono">{txn.reference}</span>
        </p>
      </div>

      <div className="text-right shrink-0">
        <p
          className={`text-sm font-semibold ${
            txn.type === 'REPAYMENT' || txn.type === 'PARTIAL_REPAYMENT'
              ? 'text-mediterranean'
              : 'text-cocoa dark:text-white'
          }`}
        >
          {meta.prefix}
          {formatKES(txn.amount)}
        </p>
        <div className="mt-0.5">
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        </div>
      </div>
    </div>
  )
}
