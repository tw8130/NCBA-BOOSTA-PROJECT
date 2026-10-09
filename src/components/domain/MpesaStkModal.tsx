import { useState, useEffect } from 'react'
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  RotateCcw,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  HelpCircle,
  Info,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/StatusBadge'
import { formatKES } from '../../lib/format'
import { triggerStkPush, stkOutcomeCopy, MAX_STK_ATTEMPTS, type StkOutcome } from '../../services/mpesa'
import { api } from '../../services/api'
import type { StkStage, Loan, Anchor } from '../../types'

export interface MpesaStkModalProps {
  loan: Loan
  anchor?: Anchor
  amount: number
  phoneNumber: string
  onClose: () => void
  onSuccess: (ftxReference?: string) => void
  onFallbackToNcba?: () => void
}

export function MpesaStkModal({
  loan,
  anchor,
  amount,
  phoneNumber,
  onClose,
  onSuccess,
  onFallbackToNcba,
}: MpesaStkModalProps) {
  const [stage, setStage] = useState<StkStage>('IDLE')
  const [attempt, setAttempt] = useState(1)
  const [copiedPaybill, setCopiedPaybill] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [showManualFallback, setShowManualFallback] = useState(false)

  // Start attempt 1 automatically on modal open
  useEffect(() => {
    executeStkAttempt(1)
  }, [])

  async function executeStkAttempt(attemptNumber: number, forceOutcome?: StkOutcome) {
    setAttempt(attemptNumber)
    setStage('SENDING')
    await new Promise((r) => setTimeout(r, 650))
    setStage('WAITING_CONFIRMATION')

    const outcome = await triggerStkPush(attemptNumber, forceOutcome)
    setStage(outcome)

    if (outcome === 'SUCCESS') {
      try {
        const res = await api.applyMpesaRepayment({ loanId: loan.id, amount })
        setTimeout(() => {
          onSuccess(res.ftxReference)
        }, 1200)
      } catch (e) {
        setTimeout(() => {
          onSuccess()
        }, 1200)
      }
    }
  }

  const retriesLeft = Math.max(0, MAX_STK_ATTEMPTS - attempt)
  const isRecoverable =
    ['WRONG_PIN', 'CANCELLED', 'TIMEOUT', 'DUPLICATE'].includes(stage) && retriesLeft > 0
  const isTerminalFailure =
    stage === 'INSUFFICIENT_FUNDS' ||
    stage === 'SYSTEM_FAILURE' ||
    (!isRecoverable && stage !== 'SUCCESS' && stage !== 'SENDING' && stage !== 'WAITING_CONFIRMATION' && stage !== 'IDLE')

  function copyText(text: string, type: 'paybill' | 'account') {
    navigator.clipboard?.writeText(text)
    if (type === 'paybill') {
      setCopiedPaybill(true)
      setTimeout(() => setCopiedPaybill(false), 2000)
    } else {
      setCopiedAccount(true)
      setTimeout(() => setCopiedAccount(false), 2000)
    }
  }

  return (
    <Modal title="M-Pesa Express Repayment" onClose={onClose}>
      <div className="space-y-4">
        {/* Loan Context Header */}
        <div className="p-3 rounded-[4px] bg-surface-light dark:bg-white/[0.02] border border-surface-border dark:border-surface-dark-border flex items-center justify-between text-xs">
          <div>
            <span className="text-text-light-muted dark:text-text-dark-muted block">Repaying Loan</span>
            <span className="font-bold text-cocoa dark:text-white">
              {anchor?.name} · <span className="font-mono">{loan.reference}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-text-light-muted dark:text-text-dark-muted block">Amount Due</span>
            <span className="font-extrabold text-cocoa dark:text-white text-sm">{formatKES(amount)}</span>
          </div>
        </div>

        {/* State Visualizer Card */}
        <div className="p-5 rounded-[6px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-center space-y-3">
          {/* Status Icon */}
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center">
            {stage === 'SENDING' && (
              <div className="w-12 h-12 rounded-full bg-sky/15 text-sky flex items-center justify-center animate-pulse">
                <Smartphone size={28} />
              </div>
            )}
            {stage === 'WAITING_CONFIRMATION' && (
              <div className="w-12 h-12 rounded-full bg-sun/20 text-cocoa dark:text-sun flex items-center justify-center animate-spin">
                <Clock size={28} />
              </div>
            )}
            {stage === 'SUCCESS' && (
              <div className="w-12 h-12 rounded-full bg-mediterranean/15 text-mediterranean flex items-center justify-center border border-mediterranean/30">
                <CheckCircle2 size={32} />
              </div>
            )}
            {stage === 'WRONG_PIN' && (
              <div className="w-12 h-12 rounded-full bg-coral/10 text-coral flex items-center justify-center border border-coral/30">
                <XCircle size={32} />
              </div>
            )}
            {stage === 'CANCELLED' && (
              <div className="w-12 h-12 rounded-full bg-coral/10 text-coral flex items-center justify-center border border-coral/30">
                <XCircle size={32} />
              </div>
            )}
            {stage === 'TIMEOUT' && (
              <div className="w-12 h-12 rounded-full bg-sun/20 text-cocoa dark:text-sun flex items-center justify-center border border-sun/40">
                <Clock size={32} />
              </div>
            )}
            {stage === 'INSUFFICIENT_FUNDS' && (
              <div className="w-12 h-12 rounded-full bg-coral/10 text-coral flex items-center justify-center border border-coral/30">
                <AlertCircle size={32} />
              </div>
            )}
            {stage === 'SYSTEM_FAILURE' && (
              <div className="w-12 h-12 rounded-full bg-coral/10 text-coral flex items-center justify-center border border-coral/30">
                <AlertCircle size={32} />
              </div>
            )}
            {stage === 'DUPLICATE' && (
              <div className="w-12 h-12 rounded-full bg-sun/20 text-cocoa dark:text-sun flex items-center justify-center border border-sun/40">
                <Clock size={32} />
              </div>
            )}
          </div>

          {/* Heading & Detail Text */}
          <div>
            <h3 className="text-[16px] font-bold text-cocoa dark:text-white">
              {stage === 'SENDING' && 'Sending M-Pesa Prompt…'}
              {stage === 'WAITING_CONFIRMATION' && 'Check Your Phone'}
              {stage === 'SUCCESS' && 'Repayment Confirmed'}
              {stage === 'WRONG_PIN' && 'Incorrect M-Pesa PIN'}
              {stage === 'CANCELLED' && 'Payment Cancelled'}
              {stage === 'TIMEOUT' && 'Request Timed Out'}
              {stage === 'INSUFFICIENT_FUNDS' && 'Insufficient M-Pesa Funds'}
              {stage === 'SYSTEM_FAILURE' && 'M-Pesa System Unavailable'}
              {stage === 'DUPLICATE' && 'Duplicate Request Pending'}
            </h3>

            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-1 max-w-xs mx-auto leading-relaxed">
              {stage === 'SENDING' && `Dispatching STK push to ${phoneNumber} for ${formatKES(amount)}.`}
              {stage === 'WAITING_CONFIRMATION' &&
                `An M-Pesa PIN prompt has been sent to ${phoneNumber}. Please input your Safaricom PIN to authorize payment.`}
              {stage === 'SUCCESS' && `${formatKES(amount)} has been applied directly to your loan balance.`}
              {stage === 'WRONG_PIN' && 'The PIN entered on your mobile phone was incorrect.'}
              {stage === 'CANCELLED' && 'The STK push prompt was dismissed or cancelled on your handset.'}
              {stage === 'TIMEOUT' && 'No confirmation was received from Safaricom within 30 seconds.'}
              {stage === 'INSUFFICIENT_FUNDS' &&
                'Your M-Pesa wallet balance is lower than the repayment amount. Please top up your wallet or pay via your NCBA account.'}
              {stage === 'SYSTEM_FAILURE' &&
                'Safaricom M-Pesa gateway could not process this request right now. Try again shortly or use your NCBA account.'}
              {stage === 'DUPLICATE' && 'A payment request with this reference is already in processing.'}
            </p>
          </div>

          {/* Security Notice: PIN never entered in BOOSTA */}
          <div className="p-2 bg-sky-tint/20 dark:bg-sky/10 border border-sky/30 rounded-[4px] text-[10px] text-cocoa dark:text-sky flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck size={13} className="shrink-0 text-sky" />
            <span>Your M-Pesa PIN is never requested or typed inside NCBA BOOSTA.</span>
          </div>

          {/* Attempt Counter Display */}
          {(stage !== 'SUCCESS' && stage !== 'SENDING') && (
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-[11px] font-semibold text-text-light-muted dark:text-text-dark-muted">
                Attempt {attempt} of {MAX_STK_ATTEMPTS}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-[20px] bg-sun/20 text-cocoa font-bold border border-sun/30">
                {retriesLeft} attempt{retriesLeft === 1 ? '' : 's'} remaining
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: Retry / Fallback */}
        {isRecoverable && (
          <div className="space-y-2">
            <Button
              full
              onClick={() => executeStkAttempt(attempt + 1)}
              disabled={stage === 'SENDING' || stage === 'WAITING_CONFIRMATION'}
            >
              <RotateCcw size={14} className="mr-1.5 inline" /> Retry STK Push ({retriesLeft} left)
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                full
                onClick={() => setShowManualFallback(!showManualFallback)}
              >
                Manual Paybill
              </Button>
              {onFallbackToNcba && (
                <Button variant="secondary" full onClick={onFallbackToNcba}>
                  Pay with NCBA
                </Button>
              )}
            </div>
          </div>
        )}

        {isTerminalFailure && (
          <div className="space-y-2">
            <p className="text-[11px] text-coral font-medium text-center">
              Maximum M-Pesa automated attempts reached. Use a fallback repayment method below.
            </p>
            {onFallbackToNcba && (
              <Button full onClick={onFallbackToNcba}>
                <CreditCard size={15} className="mr-1.5 inline" /> Pay from NCBA Account Instead
              </Button>
            )}
            <Button
              variant="secondary"
              full
              onClick={() => setShowManualFallback(!showManualFallback)}
            >
              View Manual M-Pesa Paybill Instructions
            </Button>
          </div>
        )}

        {/* Fallback Method: M-Pesa Paybill Details */}
        {showManualFallback && (
          <div className="p-3.5 bg-surface-light dark:bg-white/[0.03] border border-surface-border dark:border-surface-dark-border rounded-[4px] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cocoa dark:text-white uppercase tracking-wide text-[11px]">
                Manual M-Pesa Paybill Instructions
              </span>
              <StatusBadge label="Fallback Method" tone="neutral" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted">Paybill Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-cocoa dark:text-white">880100</span>
                  <button
                    onClick={() => copyText('880100', 'paybill')}
                    className="p-1 text-sky hover:text-sky-hover"
                    aria-label="Copy Paybill"
                  >
                    {copiedPaybill ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted">Account Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-cocoa dark:text-white">{loan.reference}</span>
                  <button
                    onClick={() => copyText(loan.reference, 'account')}
                    className="p-1 text-sky hover:text-sky-hover"
                    aria-label="Copy Account Number"
                  >
                    {copiedAccount ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted">Amount:</span>
                <span className="font-bold text-cocoa dark:text-white">{formatKES(amount)}</span>
              </div>
            </div>
            <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted pt-1">
              Go to Lipa na M-Pesa → Paybill → Enter 880100 → Account {loan.reference} → Enter PIN.
            </p>
          </div>
        )}

        {/* Demo Simulation Trigger Controls */}
        <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border">
          <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted font-bold uppercase mb-1">
            Demo Outcome Simulator:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => executeStkAttempt(attempt, 'WRONG_PIN')}
              className="px-2 py-0.5 rounded-[2px] bg-coral/10 text-coral text-[10px] font-semibold border border-coral/30"
            >
              Wrong PIN
            </button>
            <button
              type="button"
              onClick={() => executeStkAttempt(attempt, 'CANCELLED')}
              className="px-2 py-0.5 rounded-[2px] bg-coral/10 text-coral text-[10px] font-semibold border border-coral/30"
            >
              Cancelled
            </button>
            <button
              type="button"
              onClick={() => executeStkAttempt(attempt, 'TIMEOUT')}
              className="px-2 py-0.5 rounded-[2px] bg-sun/20 text-cocoa text-[10px] font-semibold border border-sun/40"
            >
              Timeout
            </button>
            <button
              type="button"
              onClick={() => executeStkAttempt(attempt, 'INSUFFICIENT_FUNDS')}
              className="px-2 py-0.5 rounded-[2px] bg-coral/10 text-coral text-[10px] font-semibold border border-coral/30"
            >
              No Funds
            </button>
            <button
              type="button"
              onClick={() => executeStkAttempt(attempt, 'SUCCESS')}
              className="px-2 py-0.5 rounded-[2px] bg-mediterranean/10 text-mediterranean text-[10px] font-semibold border border-mediterranean/30"
            >
              Success
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
