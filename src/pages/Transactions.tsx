import { useState, useMemo } from 'react'
import {
  Receipt,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Printer,
  Copy,
  Check,
  X,
} from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TransactionRow } from '../components/domain/TransactionRow'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { formatKES, formatDate, formatDateTime } from '../lib/format'
import { useApp } from '../context/AppContext'
import type { Transaction } from '../types'

type TransactionFilterCategory = 'ALL' | 'LOANS' | 'DISBURSEMENTS' | 'REPAYMENTS' | 'FEES'

const FILTERS: { id: TransactionFilterCategory; label: string }[] = [
  { id: 'ALL', label: 'All Activities' },
  { id: 'LOANS', label: 'Loan Portfolios' },
  { id: 'DISBURSEMENTS', label: 'Disbursements' },
  { id: 'REPAYMENTS', label: 'Repayments' },
  { id: 'FEES', label: 'Fees & Charges' },
]

export default function Transactions() {
  const { transactions, anchors, customer, loading } = useApp()
  const [filter, setFilter] = useState<TransactionFilterCategory>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)
  const [copiedFtx, setCopiedFtx] = useState(false)

  // Calculate high-level ledger stats
  const stats = useMemo(() => {
    let disbursed = 0
    let repaid = 0
    let fees = 0

    transactions.forEach((t) => {
      if (t.status !== 'COMPLETED') return
      if (t.type === 'DISBURSEMENT') disbursed += t.amount
      else if (t.type === 'REPAYMENT' || t.type === 'PARTIAL_REPAYMENT') repaid += t.amount
      else if (t.type === 'FEE' || t.type === 'PENALTY') fees += t.amount
    })

    return { disbursed, repaid, fees }
  }, [transactions])

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Category match
      let matchesCategory = false
      if (filter === 'ALL') matchesCategory = true
      else if (filter === 'LOANS') {
        matchesCategory =
          t.type === 'DISBURSEMENT' ||
          t.type === 'REPAYMENT' ||
          t.type === 'PARTIAL_REPAYMENT'
      } else if (filter === 'DISBURSEMENTS') {
        matchesCategory = t.type === 'DISBURSEMENT'
      } else if (filter === 'REPAYMENTS') {
        matchesCategory = t.type === 'REPAYMENT' || t.type === 'PARTIAL_REPAYMENT'
      } else if (filter === 'FEES') {
        matchesCategory = t.type === 'FEE' || t.type === 'PENALTY'
      }

      if (!matchesCategory) return false

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const anchor = anchors.find((a) => a.id === t.anchorId)
        const matchRef = t.reference.toLowerCase().includes(q)
        const matchFtx = t.ftxReference ? t.ftxReference.toLowerCase().includes(q) : false
        const matchAnchor = anchor ? anchor.name.toLowerCase().includes(q) : false
        return matchRef || matchFtx || matchAnchor
      }

      return true
    })
  }, [transactions, filter, searchQuery, anchors])

  const selectedAnchor = selectedTxn
    ? anchors.find((a) => a.id === selectedTxn.anchorId)
    : undefined

  function copyFtx(ftx: string) {
    navigator.clipboard?.writeText(ftx)
    setCopiedFtx(true)
    setTimeout(() => setCopiedFtx(false), 2000)
  }

  return (
    <AppShell title="Ledger Transactions">
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Ledger Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5 bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center justify-between text-xs text-text-light-muted dark:text-text-dark-muted mb-1">
              <span>Total Disbursed</span>
              <ArrowUpRight size={15} className="text-sky" />
            </div>
            <p className="text-xl font-bold text-cocoa dark:text-white">
              {formatKES(stats.disbursed)}
            </p>
          </Card>

          <Card className="p-3.5 bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center justify-between text-xs text-text-light-muted dark:text-text-dark-muted mb-1">
              <span>Total Repaid</span>
              <ArrowDownLeft size={15} className="text-mediterranean" />
            </div>
            <p className="text-xl font-bold text-mediterranean">
              {formatKES(stats.repaid)}
            </p>
          </Card>

          <Card className="p-3.5 bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border">
            <div className="flex items-center justify-between text-xs text-text-light-muted dark:text-text-dark-muted mb-1">
              <span>Total Fees Paid</span>
              <Coins size={15} className="text-cocoa dark:text-sun" />
            </div>
            <p className="text-xl font-bold text-cocoa dark:text-white">
              {formatKES(stats.fees)}
            </p>
          </Card>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-2.5">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-[20px] text-xs font-semibold whitespace-nowrap border transition-all ${
                  filter === f.id
                    ? 'bg-sky text-cocoa border-sky shadow-sm'
                    : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-sky/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-2.5 text-text-light-muted dark:text-text-dark-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by TXN reference, FTX code, or anchor..."
              className="w-full h-9 pl-9 pr-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-xs text-cocoa dark:text-white placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted focus:outline-none focus:border-sky"
            />
          </div>
        </div>

        {/* Transaction Ledger Table */}
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            detail="No financial transactions match your current category and search filter."
          />
        ) : (
          <Card className="p-3 sm:p-4 divide-y divide-surface-border dark:divide-surface-dark-border">
            <div className="flex items-center justify-between pb-2 text-[11px] font-bold text-text-light-muted dark:text-text-dark-muted uppercase tracking-wider">
              <span>Financial Activity ({filtered.length})</span>
              <span>Amount & Status</span>
            </div>
            {filtered.map((t) => (
              <TransactionRow
                key={t.id}
                txn={t}
                anchor={anchors.find((a) => a.id === t.anchorId)}
                onClick={() => setSelectedTxn(t)}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Transaction Detail & Receipt Modal */}
      {selectedTxn && (
        <Modal
          title="Transaction Details"
          onClose={() => setSelectedTxn(null)}
        >
          <div className="space-y-4 text-xs">
            {/* Header summary */}
            <div className="p-3 rounded-[4px] bg-surface-light dark:bg-white/[0.03] border border-surface-border dark:border-surface-dark-border flex items-center justify-between">
              <div>
                <span className="text-text-light-muted dark:text-text-dark-muted block">Transaction Ref</span>
                <span className="font-mono font-bold text-cocoa dark:text-white text-sm">
                  {selectedTxn.reference}
                </span>
              </div>
              <div className="text-right">
                <span className="text-text-light-muted dark:text-text-dark-muted block">Amount</span>
                <span className="font-extrabold text-cocoa dark:text-white text-base">
                  {formatKES(selectedTxn.amount)}
                </span>
              </div>
            </div>

            {/* FTX Reference Section */}
            {selectedTxn.ftxReference && (
              <div className="p-3 rounded-[4px] bg-sky-tint/30 dark:bg-sky/10 border border-sky/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cocoa dark:text-sky font-bold uppercase tracking-wider block">
                    Core T24 FTX Reference
                  </span>
                  <span className="font-mono font-bold text-sm text-cocoa dark:text-white">
                    {selectedTxn.ftxReference}
                  </span>
                </div>
                <button
                  onClick={() => copyFtx(selectedTxn.ftxReference!)}
                  className="px-2 py-1 rounded-[3px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border text-sky text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedFtx ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedFtx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Attributes list */}
            <div className="space-y-2 divide-y divide-surface-border dark:divide-surface-dark-border">
              <div className="flex justify-between py-1.5">
                <span className="text-text-light-muted dark:text-text-dark-muted">Type:</span>
                <span className="font-semibold text-cocoa dark:text-white">{selectedTxn.type}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-light-muted dark:text-text-dark-muted">Status:</span>
                <StatusBadge label={selectedTxn.status} tone={selectedTxn.status === 'COMPLETED' ? 'success' : 'danger'} />
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-light-muted dark:text-text-dark-muted">Date:</span>
                <span className="font-semibold text-cocoa dark:text-white">{formatDate(selectedTxn.date)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-light-muted dark:text-text-dark-muted">Anchor Partner:</span>
                <span className="font-semibold text-cocoa dark:text-white">{selectedAnchor?.name || 'NCBA Core'}</span>
              </div>
              {selectedTxn.loanId && (
                <div className="flex justify-between py-1.5">
                  <span className="text-text-light-muted dark:text-text-dark-muted">Loan Reference:</span>
                  <span className="font-mono font-semibold text-cocoa dark:text-white">{selectedTxn.loanId}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <Button full variant="secondary" onClick={() => window.print()}>
                <Printer size={14} className="mr-1.5 inline" /> Print Statement
              </Button>
              <Button full onClick={() => setSelectedTxn(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
