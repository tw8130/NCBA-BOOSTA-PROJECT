import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Building2,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatKES, formatDateTime } from '../../lib/format'
import { useApp } from '../../context/AppContext'

interface RepayStatusState {
  outcome: 'SUCCESS'
  amount: number
  loanId: string
  ftxReference?: string
  method?: 'NCBA' | 'MPESA'
  sourceDetail?: string
  remainingBalance?: number
}

export default function RepayStatus() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loans, anchors, customer } = useApp()
  const [copiedFtx, setCopiedFtx] = useState(false)

  const state = location.state as RepayStatusState | undefined
  const loan = state ? loans.find((l) => l.id === state.loanId) : loans[0]
  const anchor = loan ? anchors.find((a) => a.id === loan.anchorId) : anchors[0]

  const amount = state?.amount ?? loan?.principal ?? 0
  const ftxRef = state?.ftxReference ?? `FTX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-88492`
  const methodLabel =
    state?.method === 'MPESA'
      ? 'Safaricom M-Pesa Express'
      : state?.method === 'NCBA'
      ? 'NCBA Core Account Debit'
      : 'Electronic Funds Settlement'

  const currentOutstanding =
    state?.remainingBalance !== undefined
      ? state.remainingBalance
      : loan
      ? loan.outstandingBalance
      : 0
  const isPaidInFull = currentOutstanding === 0

  function copyFtx() {
    navigator.clipboard?.writeText(ftxRef)
    setCopiedFtx(true)
    setTimeout(() => setCopiedFtx(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <AppShell title="Repayment Confirmation" nav={false}>
      <div className="max-w-xl mx-auto py-2 sm:py-6 space-y-4">
        {/* Success Icon & Heading */}
        <div className="text-center print:hidden">
          <div className="w-16 h-16 rounded-full bg-mediterranean/15 text-mediterranean flex items-center justify-center mx-auto mb-3 border border-mediterranean/30 shadow-sm animate-bounce-once">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="text-2xl font-extrabold text-cocoa dark:text-white tracking-tight">
            Repayment Successful
          </h1>
          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
            {formatKES(amount)} has been reconciled and applied to your facility ledger.
          </p>
        </div>

        {/* Official Printable Bank Receipt Card */}
        <div
          id="printable-receipt"
          className="p-5 sm:p-6 rounded-[8px] border-2 border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper shadow-sm space-y-4 print:border-black print:shadow-none print:m-0 print:p-4"
        >
          {/* Bank Receipt Brand Header */}
          <div className="flex items-center justify-between border-b border-surface-border dark:border-surface-dark-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-cocoa text-sky flex items-center justify-center font-bold text-sm">
                B
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-cocoa dark:text-white leading-tight">
                  NCBA BOOSTA
                </h2>
                <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted block">
                  Official Transaction Electronic Receipt
                </span>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge label="Reconciled & Cleared" tone="success" />
              <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted block mt-1 font-mono">
                {formatDateTime(new Date().toISOString())}
              </span>
            </div>
          </div>

          {/* FTX Reference Box */}
          <div className="p-3 bg-surface-light dark:bg-white/[0.03] border border-surface-border dark:border-surface-dark-border rounded-[4px] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted font-bold uppercase tracking-wider block">
                FTX Payment Reference (T24 Core Ref)
              </span>
              <span className="text-sm sm:text-base font-mono font-extrabold text-cocoa dark:text-white">
                {ftxRef}
              </span>
            </div>
            <button
              onClick={copyFtx}
              className="p-1.5 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border text-sky hover:text-sky-hover print:hidden flex items-center gap-1 text-[11px] font-semibold"
              title="Copy Reference"
            >
              {copiedFtx ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedFtx ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Amount Paid Highlight */}
          <div className="text-center py-2 bg-sky-tint/30 dark:bg-sky/10 rounded-[4px] border border-sky/20">
            <span className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary block">
              Amount Paid
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-cocoa dark:text-white tracking-tight">
              {formatKES(amount)}
            </span>
            <span className="text-[10px] text-mediterranean font-bold block mt-0.5">
              Available Anchor Limit Restored (+{formatKES(amount)})
            </span>
          </div>

          {/* Receipt Breakdown Table */}
          <div className="space-y-2 text-xs divide-y divide-surface-border/60 dark:divide-surface-dark-border/60 pt-1">
            <div className="flex justify-between items-center pt-2">
              <span className="text-text-light-muted dark:text-text-dark-muted">Customer / Business:</span>
              <span className="font-semibold text-cocoa dark:text-white text-right">
                {customer?.businessName || 'Business Borrower'} ({customer?.fullName || 'Bonface Macharia'})
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-text-light-muted dark:text-text-dark-muted">Payment Channel:</span>
              <span className="font-semibold text-cocoa dark:text-white">
                {methodLabel}
              </span>
            </div>

            {state?.sourceDetail && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-text-light-muted dark:text-text-dark-muted">Source Account / Wallet:</span>
                <span className="font-mono text-cocoa dark:text-white font-medium">
                  {state.sourceDetail}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-text-light-muted dark:text-text-dark-muted">Financed Anchor:</span>
              <span className="font-semibold text-cocoa dark:text-white">
                {anchor?.name || 'Anchor'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-text-light-muted dark:text-text-dark-muted">Facility Loan Reference:</span>
              <span className="font-mono font-bold text-cocoa dark:text-white">
                {loan?.reference || 'BOO-L-1001'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-text-light-muted dark:text-text-dark-muted">New Outstanding Loan Balance:</span>
              <span
                className={`font-bold ${
                  isPaidInFull ? 'text-mediterranean' : 'text-cocoa dark:text-white'
                }`}
              >
                {formatKES(currentOutstanding)}{' '}
                {isPaidInFull && '🎉 PAID OFF'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-text-light-muted dark:text-text-dark-muted">Anchor Available Limit:</span>
              <span className="font-bold text-sky">
                {anchor ? formatKES(anchor.availableLimit) : 'Restored'}
              </span>
            </div>
          </div>

          {/* Paid Off Celebration Banner */}
          {isPaidInFull && (
            <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 flex items-center gap-2 text-xs text-mediterranean font-semibold">
              <ShieldCheck size={16} className="shrink-0 text-mediterranean" />
              <span>
                Congratulations! This loan facility has been completely settled in full.
              </span>
            </div>
          )}

          {/* Footer watermark notice */}
          <div className="pt-2 text-[10px] text-text-light-muted dark:text-text-dark-muted text-center border-t border-surface-border dark:border-surface-dark-border">
            NCBA Bank Kenya PLC • BOOSTA Supply Chain Finance Platform • Core Banking T24 Reconciliation
          </div>
        </div>

        {/* Action Controls (Hidden during print) */}
        <div className="space-y-2 pt-2 print:hidden">
          <Button full variant="secondary" onClick={handlePrint}>
            <Printer size={15} className="mr-1.5 inline" /> Print or Save Receipt (PDF)
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              full
              onClick={() => navigate('/customer/transactions')}
            >
              <Receipt size={14} className="mr-1 inline" /> View Transactions
            </Button>
            <Button
              full
              onClick={() => navigate('/customer/dashboard')}
            >
              Dashboard <ArrowRight size={14} className="ml-1 inline" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
