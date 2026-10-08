import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Landmark, Smartphone, RotateCcw, X, Wallet } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { PaymentStatusIcon } from '../../components/domain/PaymentStatus'
import { formatKES } from '../../lib/format'
import { useApp } from '../../context/AppContext'
import { api } from '../../services/api'
import { triggerStkPush, stkOutcomeCopy, MAX_STK_ATTEMPTS, type StkOutcome } from '../../services/mpesa'
import type { StkStage } from '../../types'

type Source = 'NCBA' | 'MPESA'

export default function Repay() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectedLoanId = params.get('loan')
  const { loans, anchors, loading, refresh } = useApp()
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')

  const [loanId, setLoanId] = useState<string | null>(preselectedLoanId ?? (activeLoans.length === 1 ? activeLoans[0].id : null))
  const [mode, setMode] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const [source, setSource] = useState<Source | null>(null)
  const [confirming, setConfirming] = useState(false)

  const [stage, setStage] = useState<StkStage>('IDLE')
  const [attempt, setAttempt] = useState(0)

  const loan = activeLoans.find((l) => l.id === loanId)
  const anchor = loan ? anchors.find((a) => a.id === loan.anchorId) : undefined

  if (loading) {
    return (
      <AppShell title="Repay loan">
        <LoadingState />
      </AppShell>
    )
  }

  if (activeLoans.length === 0) {
    return (
      <AppShell title="Repay loan">
        <EmptyState icon={Landmark} title="No active loans" detail="You don't have an outstanding Boosta loan to repay right now." />
      </AppShell>
    )
  }

  if (!loan) {
    return (
      <AppShell title="Repay loan" back>
        <p className="text-sm text-slate-500 mb-4">You have more than one active loan — which one are you repaying?</p>
        <div className="space-y-2 max-w-md">
          {activeLoans.map((l) => {
            const a = anchors.find((x) => x.id === l.anchorId)
            return (
              <button
                key={l.id}
                onClick={() => setLoanId(l.id)}
                className="w-full flex items-center gap-3 p-4 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-left hover:border-sky/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky flex items-center justify-center shrink-0"><Wallet size={16} /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cocoa dark:text-white">{a?.name} · {l.reference}</p>
                  <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Outstanding {formatKES(l.outstandingBalance)}</p>
                </div>
              </button>
            )
          })}
        </div>
      </AppShell>
    )
  }

  const amount = mode === 'full' ? loan.outstandingBalance : Number(partialAmount.replace(/,/g, '')) || 0
  const newBalance = Math.max(0, loan.outstandingBalance - amount)

  async function payFromNcba() {
    setConfirming(true)
    await api.repayFromNcbaAccount({ loanId: loan!.id, amount })
    await refresh()
    navigate('/customer/repay/status', { state: { outcome: 'SUCCESS', amount, loanId: loan!.id } })
  }

  async function runStkAttempt(nextAttempt: number, forceOutcome?: StkOutcome) {
    setAttempt(nextAttempt)
    setStage('SENDING')
    await new Promise((r) => setTimeout(r, 700))
    setStage('WAITING_CONFIRMATION')
    const outcome = await triggerStkPush(nextAttempt, forceOutcome)
    setStage(outcome)

    if (outcome === 'SUCCESS') {
      await api.applyMpesaRepayment({ loanId: loan!.id, amount })
      await refresh()
      setTimeout(() => navigate('/customer/repay/status', { state: { outcome: 'SUCCESS', amount, loanId: loan!.id } }), 1200)
    }
  }

  const retriesLeft = MAX_STK_ATTEMPTS - attempt
  const isTerminalFailure = stage === 'INSUFFICIENT_FUNDS' || stage === 'SYSTEM_FAILURE' || (stage !== 'SUCCESS' && stage !== 'IDLE' && retriesLeft <= 0)
  const isRecoverable = ['WRONG_PIN', 'CANCELLED', 'TIMEOUT'].includes(stage) && retriesLeft > 0

  return (
    <AppShell title="Repay loan" back>
      <div className="max-w-md">
        <Card className="p-4 mb-4">
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Current balance · {anchor?.name} · {loan.reference}</p>
          <p className="text-3xl font-bold text-cocoa dark:text-white">{formatKES(loan.outstandingBalance)}</p>
        </Card>

        {source === 'MPESA' && stage !== 'IDLE' ? (
          <Card className="p-6 text-center">
            <PaymentStatusIcon stage={stage} />
            <p className="font-bold text-cocoa dark:text-white mt-4">
              {stage === 'SENDING' && 'Sending request…'}
              {stage === 'WAITING_CONFIRMATION' && 'Check your phone'}
              {stage !== 'SENDING' && stage !== 'WAITING_CONFIRMATION' && stage !== 'SUCCESS' && stkOutcomeCopy(stage as StkOutcome).title}
              {stage === 'SUCCESS' && 'Payment successful'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {stage === 'SENDING' && `An M-Pesa prompt is being sent for ${formatKES(amount)}.`}
              {stage === 'WAITING_CONFIRMATION' && 'Enter your M-Pesa PIN on your phone to confirm.'}
              {stage !== 'SENDING' && stage !== 'WAITING_CONFIRMATION' && stage !== 'SUCCESS' && stkOutcomeCopy(stage as StkOutcome).detail}
              {stage === 'SUCCESS' && `${formatKES(amount)} has been applied to ${loan.reference}.`}
            </p>

            {isRecoverable && (
              <>
                <p className="text-xs font-semibold text-cocoa dark:text-white bg-sun/20 border border-sun/40 rounded-[4px] px-3 py-2 mt-4 mb-4 inline-block">
                  You have {retriesLeft} attempt{retriesLeft === 1 ? '' : 's'} remaining.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" full onClick={() => { setStage('IDLE'); setSource(null); setAttempt(0) }}>
                    <span className="flex items-center justify-center gap-1.5"><X size={15} /> Cancel</span>
                  </Button>
                  <Button full onClick={() => runStkAttempt(attempt + 1)}>
                    <span className="flex items-center justify-center gap-1.5"><RotateCcw size={15} /> Try again</span>
                  </Button>
                </div>
              </>
            )}

            {isTerminalFailure && (
              <div className="mt-4">
                {stage !== 'INSUFFICIENT_FUNDS' && stage !== 'SYSTEM_FAILURE' && (
                  <p className="text-xs text-slate-500 mb-3">
                    You have reached the maximum number of attempts. Please start a new payment when you are ready.
                  </p>
                )}
                <Button full variant="secondary" onClick={() => { setStage('IDLE'); setSource(null); setAttempt(0) }}>
                  Choose a different payment method
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <>
            <Card className="p-4 mb-4">
              <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary mb-3">How much are you paying?</p>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setMode('full')}
                  className={`flex-1 py-2 rounded-[4px] text-[12px] font-semibold border transition-colors ${
                    mode === 'full'
                      ? 'bg-sky text-cocoa border-sky'
                      : 'border-surface-border dark:border-surface-dark-border text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-surface-dark-paper'
                  }`}
                >
                  Full payment
                </button>
                <button
                  onClick={() => setMode('partial')}
                  className={`flex-1 py-2 rounded-[4px] text-[12px] font-semibold border transition-colors ${
                    mode === 'partial'
                      ? 'bg-sky text-cocoa border-sky'
                      : 'border-surface-border dark:border-surface-dark-border text-text-light-secondary dark:text-text-dark-secondary bg-white dark:bg-surface-dark-paper'
                  }`}
                >
                  Partial payment
                </button>
              </div>
              {mode === 'partial' && (
                <>
                  <input
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="Enter amount"
                    inputMode="numeric"
                    className="w-full h-[38px] px-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-[13px] text-cocoa dark:text-text-dark-primary focus:outline-none focus:border-sky"
                  />
                  {amount > 0 && (
                    <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-2">
                      New estimated balance: <span className="font-semibold text-cocoa dark:text-white">{formatKES(newBalance)}</span>
                    </p>
                  )}
                </>
              )}
            </Card>

            <Card className="p-4">
              <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary mb-3">Payment source</p>
              <div className="space-y-2 mb-4">
                <SourceOption icon={Landmark} label="NCBA account" detail="Instant debit from linked account" active={source === 'NCBA'} onClick={() => setSource('NCBA')} />
                <SourceOption icon={Smartphone} label="M-Pesa" detail="STK push prompt to your phone" active={source === 'MPESA'} onClick={() => setSource('MPESA')} />
              </div>

              <Button
                full
                disabled={amount <= 0 || !source || confirming}
                onClick={() => (source === 'NCBA' ? payFromNcba() : runStkAttempt(1))}
              >
                {confirming ? 'Processing…' : `Pay ${amount > 0 ? formatKES(amount) : ''}`}
              </Button>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  )
}

function SourceOption({ icon: Icon, label, detail, active, onClick }: {
  icon: typeof Landmark
  label: string
  detail: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-[4px] border text-left transition-colors ${
        active
          ? 'border-sky bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-white'
          : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary hover:border-sky/30'
      }`}
    >
      <div className="w-8 h-8 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border flex items-center justify-center text-cocoa dark:text-sky shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary">{label}</p>
        <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">{detail}</p>
      </div>
      <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${active ? 'border-sky bg-sky' : 'border-surface-border dark:border-surface-dark-border'}`} />
    </button>
  )
}

