import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Landmark,
  Smartphone,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { MpesaStkModal } from '../../components/domain/MpesaStkModal'
import { formatKES, formatDate, daysUntil } from '../../lib/format'
import { useApp } from '../../context/AppContext'
import { api } from '../../services/api'
import type { Loan } from '../../types'

type RepaySource = 'NCBA' | 'MPESA'

export default function Repay() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectedLoanId = params.get('loanId') || params.get('loan')
  const { customer, loans, anchors, loading, refresh } = useApp()

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(
    preselectedLoanId ?? (activeLoans.length === 1 ? activeLoans[0].id : null)
  )
  const [mode, setMode] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const [source, setSource] = useState<RepaySource>('MPESA')
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone || '254712345678')
  const [selectedNcbaAccount, setSelectedNcbaAccount] = useState(
    customer?.ncbaAccountNumber || '014029482910'
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [showStkModal, setShowStkModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (customer?.phone && (!phoneNumber || phoneNumber === '254712345678')) {
      setPhoneNumber(customer.phone)
    }
    if (customer?.ncbaAccountNumber) {
      setSelectedNcbaAccount(customer.ncbaAccountNumber)
    }
  }, [customer])

  const loan = activeLoans.find((l) => l.id === selectedLoanId)
  const anchor = loan ? anchors.find((a) => a.id === loan.anchorId) : undefined

  if (loading) {
    return (
      <AppShell title="Repay Loan">
        <LoadingState />
      </AppShell>
    )
  }

  if (activeLoans.length === 0) {
    return (
      <AppShell title="Repay Loan">
        <EmptyState
          icon={Landmark}
          title="No outstanding loans"
          detail="All your BOOSTA facilities are fully paid off. You have zero outstanding balance."
        />
        <div className="max-w-xs mx-auto mt-4">
          <Button full onClick={() => navigate('/customer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </AppShell>
    )
  }

  // If no loan is selected yet, show loan picker screen
  if (!loan) {
    return (
      <AppShell title="Select Loan to Repay" back>
        <div className="max-w-xl mx-auto space-y-4">
          <div>
            <h2 className="text-lg font-bold text-cocoa dark:text-white">Choose a facility to repay</h2>
            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              You have {activeLoans.length} active loan{activeLoans.length === 1 ? '' : 's'}. Select one to proceed:
            </p>
          </div>

          <div className="space-y-2.5">
            {activeLoans.map((l) => {
              const anc = anchors.find((x) => x.id === l.anchorId)
              const days = daysUntil(l.dueDate)
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelectedLoanId(l.id)
                    setMode('full')
                    setPartialAmount('')
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-[6px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-left hover:border-sky transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky flex items-center justify-center font-bold text-sm shrink-0">
                      {anc?.logoInitial || 'N'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-cocoa dark:text-white">{anc?.name}</span>
                        <span className="text-xs font-mono text-text-light-muted dark:text-text-dark-muted">
                          {l.reference}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                        <span>Due {formatDate(l.dueDate)}</span>
                        <span>•</span>
                        <span className={days <= 3 ? 'text-coral font-bold' : ''}>
                          {days < 0 ? 'Overdue' : `${days} days left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-text-light-muted dark:text-text-dark-muted block">Balance</span>
                    <span className="font-extrabold text-cocoa dark:text-white text-base">
                      {formatKES(l.outstandingBalance)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </AppShell>
    )
  }

  // Calculate payment numbers
  const parsedPartial = Number(partialAmount.replace(/,/g, '')) || 0
  const amountToPay = mode === 'full' ? loan.outstandingBalance : parsedPartial
  const remainingBalance = Math.max(0, loan.outstandingBalance - amountToPay)
  const days = daysUntil(loan.dueDate)

  function handleSetChip(pct: number) {
    if (!loan) return
    const computed = Math.min(loan.outstandingBalance, Math.round(loan.outstandingBalance * pct))
    setPartialAmount(computed.toString())
    setErrorMsg(null)
  }

  async function handleNcbaDebit() {
    if (!loan || amountToPay <= 0) return
    if (amountToPay > loan.outstandingBalance) {
      setErrorMsg(`Amount cannot exceed outstanding balance of ${formatKES(loan.outstandingBalance)}`)
      return
    }

    setIsProcessing(true)
    setErrorMsg(null)

    try {
      const res = await api.repayFromNcbaAccount({
        loanId: loan.id,
        amount: amountToPay,
      })
      await refresh()
      navigate('/customer/repay/status', {
        state: {
          outcome: 'SUCCESS',
          amount: amountToPay,
          loanId: loan.id,
          ftxReference: res.ftxReference,
          method: 'NCBA',
          sourceDetail: `NCBA Account (${selectedNcbaAccount})`,
          remainingBalance,
        },
      })
    } catch (err: any) {
      setErrorMsg(err?.message || 'Repayment failed. Please try again.')
      setIsProcessing(false)
    }
  }

  function handleInitiatePayment() {
    if (!loan) return
    if (amountToPay <= 0) {
      setErrorMsg('Please enter a valid repayment amount')
      return
    }
    if (amountToPay > loan.outstandingBalance) {
      setErrorMsg(`Amount cannot exceed outstanding balance of ${formatKES(loan.outstandingBalance)}`)
      return
    }

    if (source === 'MPESA') {
      if (!phoneNumber || phoneNumber.trim().length < 9) {
        setErrorMsg('Please enter a valid Safaricom M-Pesa phone number')
        return
      }
      setShowStkModal(true)
    } else {
      handleNcbaDebit()
    }
  }

  return (
    <AppShell title="Repay Loan" back>
      <div className="max-w-xl mx-auto space-y-4">
        {/* Selected Loan Summary Card with switcher */}
        <div className="p-4 rounded-[6px] bg-cocoa text-white shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-sky">{anchor?.name}</span>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs font-mono text-white/80">{loan.reference}</span>
            </div>
            <div className="mt-1">
              <span className="text-xs text-white/70 block">Outstanding Loan Balance</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {formatKES(loan.outstandingBalance)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/70 mt-1">
              <span>Matures: {formatDate(loan.dueDate)}</span>
              <span className={days <= 3 ? 'text-coral font-bold bg-white/10 px-1.5 py-0.2 rounded' : ''}>
                {days < 0 ? 'Overdue' : `(${days} days left)`}
              </span>
            </div>
          </div>

          {activeLoans.length > 1 && (
            <button
              onClick={() => setSelectedLoanId(null)}
              className="px-2.5 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors shrink-0"
            >
              Change Loan
            </button>
          )}
        </div>

        {/* Repayment Amount Selector Card */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-cocoa dark:text-white">Repayment Amount</h3>
            <span className="text-xs text-text-light-muted dark:text-text-dark-muted font-mono">
              Limit restore: +{formatKES(amountToPay)}
            </span>
          </div>

          {/* Mode Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('full')
                setErrorMsg(null)
              }}
              className={`py-2.5 px-3 rounded-[4px] text-xs font-bold border transition-all ${
                mode === 'full'
                  ? 'bg-sky text-cocoa border-sky shadow-sm'
                  : 'bg-surface-light dark:bg-white/[0.03] text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-sky/40'
              }`}
            >
              Full Payoff ({formatKES(loan.outstandingBalance)})
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('partial')
                if (!partialAmount) {
                  setPartialAmount(Math.round(loan.outstandingBalance / 2).toString())
                }
                setErrorMsg(null)
              }}
              className={`py-2.5 px-3 rounded-[4px] text-xs font-bold border transition-all ${
                mode === 'partial'
                  ? 'bg-sky text-cocoa border-sky shadow-sm'
                  : 'bg-surface-light dark:bg-white/[0.03] text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-sky/40'
              }`}
            >
              Partial Repayment
            </button>
          </div>

          {/* Partial Amount Input & Quick Chips */}
          {mode === 'partial' && (
            <div className="space-y-3 pt-1 border-t border-surface-border dark:border-surface-dark-border">
              <label className="block text-xs font-semibold text-cocoa dark:text-text-dark-primary">
                Specify Partial Amount (KES)
              </label>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-text-light-muted dark:text-text-dark-muted">
                  KES
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={partialAmount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^\d]/g, '')
                    setPartialAmount(clean)
                    setErrorMsg(null)
                  }}
                  placeholder="e.g. 250,000"
                  className="w-full h-10 pl-12 pr-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-sm font-bold text-cocoa dark:text-white focus:outline-none focus:border-sky"
                />
              </div>

              {/* Quick Ratio Chips */}
              <div className="flex gap-2">
                {[
                  { label: '25%', ratio: 0.25 },
                  { label: '50%', ratio: 0.5 },
                  { label: '75%', ratio: 0.75 },
                  { label: '100%', ratio: 1.0 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSetChip(chip.ratio)}
                    className="flex-1 py-1 rounded-[3px] bg-black/5 dark:bg-white/5 hover:bg-sky/20 text-[11px] font-semibold text-cocoa dark:text-white transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Remaining Balance Recalculation */}
          <div className="mt-4 p-3 rounded-[4px] bg-surface-light dark:bg-white/[0.03] border border-surface-border dark:border-surface-dark-border flex items-center justify-between text-xs">
            <span className="text-text-light-secondary dark:text-text-dark-secondary">
              Remaining Loan Balance:
            </span>
            <span
              className={`font-bold ${
                remainingBalance === 0
                  ? 'text-mediterranean'
                  : 'text-cocoa dark:text-white'
              }`}
            >
              {formatKES(remainingBalance)}{' '}
              {remainingBalance === 0 && <span className="text-[10px]">(Paid Off)</span>}
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs text-coral font-medium mt-2">{errorMsg}</p>
          )}
        </Card>

        {/* Payment Source Selection Card */}
        <Card className="p-4 sm:p-5">
          <h3 className="text-sm font-bold text-cocoa dark:text-white mb-3">
            Select Repayment Channel
          </h3>

          <div className="space-y-2.5">
            {/* M-Pesa STK Option */}
            <button
              type="button"
              onClick={() => {
                setSource('MPESA')
                setErrorMsg(null)
              }}
              className={`w-full flex items-start gap-3 p-3.5 rounded-[4px] border text-left transition-all ${
                source === 'MPESA'
                  ? 'border-sky bg-sky-tint/40 dark:bg-sky/15 text-cocoa dark:text-white shadow-sm'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper hover:border-sky/30'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border flex items-center justify-center text-cocoa dark:text-sky shrink-0 mt-0.5">
                <Smartphone size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-cocoa dark:text-white">Safaricom M-Pesa Express</p>
                  <StatusBadge label="STK Push" tone="neutral" />
                </div>
                <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-0.5">
                  Instant STK push notification sent directly to your phone for PIN authentication.
                </p>

                {source === 'MPESA' && (
                  <div className="mt-3 pt-3 border-t border-sky/20">
                    <label className="block text-[11px] font-semibold text-cocoa dark:text-white mb-1">
                      M-Pesa Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="254712345678"
                      className="w-full h-8 px-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-xs font-mono font-bold text-cocoa dark:text-white focus:outline-none focus:border-sky"
                    />
                    <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted mt-1">
                      Native Safaricom prompt with 3 automated attempts & fallback paybill.
                    </p>
                  </div>
                )}
              </div>
            </button>

            {/* NCBA Account Debit Option */}
            <button
              type="button"
              onClick={() => {
                setSource('NCBA')
                setErrorMsg(null)
              }}
              className={`w-full flex items-start gap-3 p-3.5 rounded-[4px] border text-left transition-all ${
                source === 'NCBA'
                  ? 'border-sky bg-sky-tint/40 dark:bg-sky/15 text-cocoa dark:text-white shadow-sm'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper hover:border-sky/30'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border flex items-center justify-center text-cocoa dark:text-sky shrink-0 mt-0.5">
                <Landmark size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-cocoa dark:text-white">NCBA Bank Account Debit</p>
                  <StatusBadge label="Direct T24" tone="neutral" />
                </div>
                <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-0.5">
                  Direct real-time ledger settlement from your verified NCBA operating account.
                </p>

                {source === 'NCBA' && (
                  <div className="mt-3 pt-3 border-t border-sky/20">
                    <label className="block text-[11px] font-semibold text-cocoa dark:text-white mb-1">
                      Debit Account
                    </label>
                    <select
                      value={selectedNcbaAccount}
                      onChange={(e) => setSelectedNcbaAccount(e.target.value)}
                      className="w-full h-8 px-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-xs font-medium text-cocoa dark:text-white focus:outline-none focus:border-sky"
                    >
                      <option value="014029482910">
                        {customer?.businessName || 'Business Operating'} — 014029482910
                      </option>
                      <option value="100234567890">
                        NCBA Commercial Current — 100234567890
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Security Banner */}
          <div className="p-2.5 mt-4 rounded-[4px] bg-surface-light dark:bg-white/[0.02] border border-surface-border dark:border-surface-dark-border flex items-center gap-2 text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
            <ShieldCheck size={15} className="text-mediterranean shrink-0" />
            <span>
              Real-time ledger reconciliation. Repaying immediately increases your available anchor limit.
            </span>
          </div>

          {/* Action CTA */}
          <div className="pt-4">
            <Button
              full
              disabled={amountToPay <= 0 || isProcessing}
              onClick={handleInitiatePayment}
            >
              {isProcessing
                ? 'Processing NCBA Debit…'
                : `Authorize Repayment of ${formatKES(amountToPay)}`}
            </Button>
          </div>
        </Card>
      </div>

      {/* M-Pesa STK Push Modal */}
      {showStkModal && loan && (
        <MpesaStkModal
          loan={loan}
          anchor={anchor}
          amount={amountToPay}
          phoneNumber={phoneNumber}
          onClose={() => setShowStkModal(false)}
          onFallbackToNcba={() => {
            setShowStkModal(false)
            setSource('NCBA')
          }}
          onSuccess={async (ftxReference) => {
            setShowStkModal(false)
            await refresh()
            navigate('/customer/repay/status', {
              state: {
                outcome: 'SUCCESS',
                amount: amountToPay,
                loanId: loan.id,
                ftxReference: ftxReference || `FTX-${Date.now().toString().slice(-8)}`,
                method: 'MPESA',
                sourceDetail: `M-Pesa (${phoneNumber})`,
                remainingBalance,
              },
            })
          }}
        />
      )}
    </AppShell>
  )
}
