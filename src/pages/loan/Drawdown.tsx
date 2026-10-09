import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Users,
  Building2,
  Info,
  ArrowRight,
} from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { FormLayout } from '../../components/layout/FormLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Stepper } from '../../components/ui/Stepper'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { CRBRestrictionModal } from '../../components/domain/CRBRestrictionModal'
import { formatKES } from '../../lib/format'
import { calculateDrawdownBreakdown } from '../../lib/calculations'
import { useApp } from '../../context/AppContext'
import { useOnboarding } from '../../context/OnboardingContext'
import { api } from '../../services/api'
import type { DrawdownRequest, LoanTenorDays, MandateType } from '../../types'

const STEPS = ['Select Anchor', 'Amount', 'Tenor & Purpose', 'Review & Submit']
const PURPOSES = [
  'Stock purchase',
  'Restocking ahead of peak season',
  'Bridging a large supplier order',
  'Emergency inventory replenishment',
]

export default function Drawdown() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselected = params.get('anchor')

  const { anchors, loans, refresh } = useApp()
  const { state: onboardingState } = useOnboarding()

  const [step, setStep] = useState(0)
  const [anchorId, setAnchorId] = useState<string | null>(preselected)
  const [amount, setAmount] = useState('150000')
  const [tenor, setTenor] = useState<LoanTenorDays>(30)
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [submitting, setSubmitting] = useState(false)
  const [showCrbModal, setShowCrbModal] = useState(false)

  // Result state
  const [submittedRequest, setSubmittedRequest] = useState<DrawdownRequest | null>(null)
  const [instantLoanRef, setInstantLoanRef] = useState<string | null>(null)

  useEffect(() => {
    if (preselected && anchors.some((a) => a.id === preselected)) {
      setAnchorId(preselected)
      setStep(1)
    }
  }, [preselected, anchors])

  const anchor = anchors.find((a) => a.id === anchorId)
  const amountNum = Number(amount.replace(/,/g, '')) || 0
  const overLimit = anchor ? amountNum > anchor.availableLimit : false
  const activeLoansHere = anchor ? loans.filter((l) => l.anchorId === anchor.id && l.status === 'ACTIVE').length : 0

  // Allowed tenors strictly determined by anchor
  const allowedTenors: LoanTenorDays[] = (anchor?.allowedTenors && anchor.allowedTenors.length > 0)
    ? anchor.allowedTenors
    : [7, 14, 30, 60, 90]

  // Default tenor to first allowed tenor if current is not allowed
  useEffect(() => {
    if (anchor && !allowedTenors.includes(tenor)) {
      setTenor(allowedTenors[0])
    }
  }, [anchor, allowedTenors, tenor])

  // Mandate configuration from onboarding or customer profile
  const customerMandate: MandateType = onboardingState.mandate || 'SINGLE'
  const isJoint = customerMandate === 'JOINT_ANY' || customerMandate === 'JOINT_ALL'

  // Live Calculations Breakdown using calculations engine
  const breakdown = calculateDrawdownBreakdown({
    principal: amountNum,
    tenorDays: tenor,
    facilityFeePct: anchor?.facilityFeePct ?? 2.5,
  })

  async function handleSubmit() {
    if (!anchor || amountNum <= 0 || overLimit) return
    setSubmitting(true)

    try {
      const signatoriesToUse = isJoint
        ? onboardingState.signatories && onboardingState.signatories.length > 0
          ? onboardingState.signatories.map((s) => ({
              id: s.id,
              fullName: s.fullName,
              phone: s.phone,
            }))
          : [
              { id: 'sig-1', fullName: 'Grace Wambui (Director)', phone: '0722 100 200' },
              { id: 'sig-2', fullName: 'David Omondi (Director)', phone: '0722 300 400' },
            ]
        : []

      const res = await api.createDrawdown({
        anchorId: anchor.id,
        amount: amountNum,
        tenorDays: tenor,
        purpose,
        mandate: customerMandate,
        signatories: signatoriesToUse,
      })

      if (res.status === 'DISBURSED') {
        setInstantLoanRef(res.loan?.reference || 'BOO-L-NEW')
        setSubmittedRequest(res.drawdownRequest)
      } else {
        setSubmittedRequest(res.drawdownRequest)
      }

      await refresh()
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Success / Post-Submission Screen
  // ---------------------------------------------------------------------------
  if (submittedRequest) {
    const isDisbursed = submittedRequest.status === 'DISBURSED'

    return (
      <AppShell title="Drawdown Request Status" nav={false}>
        <div className="max-w-2xl mx-auto py-6 space-y-6">
          <Card className="p-6 text-center border-surface-border dark:border-surface-dark-border">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 bg-mediterranean/10 text-mediterranean border border-mediterranean/20">
              {isDisbursed ? <CheckCircle2 size={36} /> : <Clock size={36} className="text-cocoa dark:text-sun" />}
            </div>

            <StatusBadge
              label={isDisbursed ? 'DISBURSED TO ANCHOR' : 'AWAITING SIGNATORY APPROVAL'}
              tone={isDisbursed ? 'success' : 'warning'}
            />

            <h2 className="text-2xl font-bold text-cocoa dark:text-white mt-2">
              {formatKES(submittedRequest.amount)}
            </h2>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-0.5">
              Reference: <span className="font-mono font-bold">{submittedRequest.reference}</span> · Anchor:{' '}
              <span className="font-semibold text-cocoa dark:text-white">{anchor?.name}</span>
            </p>

            {isDisbursed ? (
              <div className="my-5 p-3.5 bg-mediterranean/10 border border-mediterranean/20 rounded-[4px] text-left text-xs text-cocoa dark:text-text-dark-primary space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-cocoa dark:text-white">
                  <ShieldCheck size={15} className="text-mediterranean" />
                  Direct Anchor Collection Settlement
                </p>
                <p className="text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
                  Funds have been credited directly to {anchor?.name}'s collection account (Account:{' '}
                  {anchor?.collectionAccountNumber || '1002450091'}). Loan Reference:{' '}
                  <span className="font-mono font-semibold">{instantLoanRef}</span>.
                </p>
                <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted pt-1">
                  Maturity Date: {breakdown.dueDateFormatted} ({breakdown.tenorDays} days) · Total Repayable:{' '}
                  {formatKES(breakdown.totalRepayable)}
                </p>
              </div>
            ) : (
              <div className="my-5 p-3.5 bg-sun/15 border border-sun/30 rounded-[4px] text-left text-xs text-cocoa dark:text-text-dark-primary space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-cocoa dark:text-white">
                  <Users size={15} className="text-cocoa dark:text-sun" />
                  Multi-Party Mandate ({customerMandate})
                </p>
                <p className="text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
                  Your entity mandate requires authorization before funds are released. Automated SMS links have been
                  dispatched to the designated directors/partners.
                </p>
              </div>
            )}

            {/* If Joint Mandate: Display Signatory Progress Tracker & SMS Links */}
            {!isDisbursed && submittedRequest.approvals.length > 0 && (
              <div className="text-left mt-5 space-y-3">
                <h4 className="text-[12px] font-bold text-cocoa dark:text-text-dark-primary uppercase tracking-wide">
                  Signatory Approval Tracker
                </h4>
                <div className="space-y-2">
                  {submittedRequest.approvals.map((app) => (
                    <div
                      key={app.token}
                      className="p-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-cocoa dark:text-white">
                            {app.signatoryName}
                          </span>
                          <StatusBadge
                            label={app.status === 'APPROVED' ? 'Signed' : 'Pending OTP & Signature'}
                            tone={app.status === 'APPROVED' ? 'success' : 'neutral'}
                          />
                        </div>
                        <p className="text-[11px] font-mono text-text-light-muted dark:text-text-dark-muted mt-0.5">
                          Single-Use Token: {app.token}
                        </p>
                      </div>

                      {/* Direct Simulator Link for Demo / Prototype */}
                      <a
                        href={`/signatory/review/${app.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-sky text-cocoa text-[11px] font-semibold hover:bg-sky-hover transition-colors shrink-0"
                      >
                        <ExternalLink size={12} /> Test Signatory SMS Link
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button full variant="secondary" onClick={() => navigate('/customer/dashboard')}>
                Return to Dashboard
              </Button>
              <Button full onClick={() => navigate('/customer/loans')}>
                View My Loans
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Right Column: Live Calculation Breakdown Panel (35%)
  // ---------------------------------------------------------------------------
  const rightBreakdownPanel = (
    <div className="space-y-3 text-xs">
      <div className="p-2.5 rounded-[4px] bg-surface-light dark:bg-white/[0.02] border border-surface-border dark:border-surface-dark-border">
        <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted uppercase font-semibold">
          Selected Anchor
        </p>
        <p className="text-[13px] font-bold text-cocoa dark:text-white mt-0.5">
          {anchor ? anchor.name : 'None selected'}
        </p>
        {anchor && (
          <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
            Available: {formatKES(anchor.availableLimit)} · Fee: {anchor.facilityFeePct ?? 2.5}%
          </p>
        )}
      </div>

      <div className="space-y-2 pt-1 border-t border-surface-border dark:border-surface-dark-border">
        <div className="flex justify-between items-center">
          <span className="text-text-light-secondary dark:text-text-dark-secondary">Principal Amount</span>
          <span className="font-bold text-cocoa dark:text-white text-[13px]">
            {formatKES(breakdown.principal)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-text-light-muted dark:text-text-dark-muted">
            Facility Fee ({breakdown.facilityFeePct}%)
          </span>
          <span className="font-medium text-cocoa dark:text-white">
            {formatKES(breakdown.facilityFee)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-text-light-muted dark:text-text-dark-muted">
            Interest (17.1% p.a. · {breakdown.tenorDays}d)
          </span>
          <span className="font-medium text-cocoa dark:text-white">
            {formatKES(breakdown.interest)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-text-light-muted dark:text-text-dark-muted">
            Credit Life Insurance (0.011%)
          </span>
          <span className="font-medium text-cocoa dark:text-white">
            {formatKES(breakdown.insurance)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-text-light-muted dark:text-text-dark-muted">
            Excise Duty (20% on fees)
          </span>
          <span className="font-medium text-cocoa dark:text-white">
            {formatKES(breakdown.exciseDuty)}
          </span>
        </div>

        <div className="pt-2 border-t border-dashed border-surface-border dark:border-surface-dark-border flex justify-between items-center">
          <span className="font-semibold text-cocoa dark:text-white">Net to Anchor Account</span>
          <span className="font-bold text-mediterranean text-[13px]">
            {formatKES(breakdown.disbursedToAnchor)}
          </span>
        </div>

        <div className="p-2 rounded-[4px] bg-sky-tint/20 dark:bg-sky/10 border border-sky/30 flex justify-between items-center">
          <div>
            <span className="block font-bold text-cocoa dark:text-white text-[12px]">
              Total Repayable
            </span>
            <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted">
              Due {breakdown.dueDateFormatted}
            </span>
          </div>
          <span className="font-extrabold text-cocoa dark:text-white text-[15px]">
            {formatKES(breakdown.totalRepayable)}
          </span>
        </div>
      </div>

      <div className="p-2 rounded-[4px] bg-sun/15 border border-sun/30 text-[10px] text-text-light-secondary dark:text-text-dark-secondary flex items-start gap-1.5 leading-snug">
        <Info size={13} className="text-cocoa dark:text-sun shrink-0 mt-0.5" />
        <span>{breakdown.disclaimer}</span>
      </div>
    </div>
  )

  // ---------------------------------------------------------------------------
  // Left Column: Step-by-Step Form (65%)
  // ---------------------------------------------------------------------------
  const leftForm = (
    <div className="space-y-5">
      <Stepper steps={STEPS} current={step} />

      {/* Step 1: Anchor Selection */}
      {step === 0 && (
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-[15px] font-bold text-cocoa dark:text-text-dark-primary">
              1. Select Supply Chain Anchor
            </h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Select the approved corporate manufacturer or distributor for this stock order.
            </p>
          </div>

          <div className="space-y-3">
            {anchors.map((a) => {
              const isRestricted = !a.drawdownAllowed
              const isSelected = anchorId === a.id

              return (
                <div
                  key={a.id}
                  onClick={() => {
                    if (isRestricted) {
                      setAnchorId(a.id)
                      setShowCrbModal(true)
                    } else {
                      setAnchorId(a.id)
                    }
                  }}
                  className={`p-3.5 rounded-[4px] border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky bg-sky-tint/15 dark:bg-sky/10'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper hover:border-sky/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[4px] bg-cocoa text-white font-bold flex items-center justify-center text-sm">
                        {a.logoInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-cocoa dark:text-white">
                            {a.name}
                          </span>
                          <StatusBadge
                            label={isRestricted ? 'CRB Hold' : 'Available'}
                            tone={isRestricted ? 'warning' : 'success'}
                          />
                        </div>
                        <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
                          Approved: {formatKES(a.approvedLimit)} · Available:{' '}
                          <span className="font-semibold text-cocoa dark:text-white">
                            {formatKES(a.availableLimit)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-medium text-text-light-muted dark:text-text-dark-muted block">
                        Facility Fee
                      </span>
                      <span className="text-[12px] font-bold text-cocoa dark:text-white">
                        {a.facilityFeePct ?? 2.5}%
                      </span>
                    </div>
                  </div>

                  {isRestricted && (
                    <div className="mt-2.5 pt-2 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-[11px] text-coral">
                      <span>Drawdown on hold pending CRB refresh</span>
                      <span className="font-semibold underline">View notice</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <Button
              full
              disabled={!anchorId || !anchors.find((a) => a.id === anchorId)?.drawdownAllowed}
              onClick={() => setStep(1)}
            >
              Continue to Amount <ArrowRight size={14} className="ml-1 inline" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Amount with 25% / 50% / Full Chips & Live Limit Validation */}
      {step === 1 && anchor && (
        <Card className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-cocoa dark:text-text-dark-primary">
                2. Drawdown Amount
              </h2>
              <span className="text-[11px] font-semibold text-sky bg-sky/10 px-2 py-0.5 rounded-[4px]">
                {anchor.name}
              </span>
            </div>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Available Limit:{' '}
              <span className="font-bold text-cocoa dark:text-white">{formatKES(anchor.availableLimit)}</span>
            </p>
            {activeLoansHere > 0 && (
              <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-1">
                You already hold {activeLoansHere} active loan{activeLoansHere > 1 ? 's' : ''} with {anchor.name}. Each
                loan runs on its own independent tenor and maturity.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cocoa dark:text-text-dark-primary uppercase tracking-wide mb-1.5">
              Order Value (KES)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[14px] font-bold text-text-light-muted dark:text-text-dark-muted">
                KES
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d]/g, '')
                  setAmount(cleaned)
                }}
                className="w-full pl-14 pr-4 py-2.5 text-2xl font-bold font-mono text-cocoa dark:text-white rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky"
                placeholder="0"
              />
            </div>

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-3 gap-2 mt-2.5">
              {[0.25, 0.5, 1.0].map((ratio) => {
                const chipValue = Math.floor(anchor.availableLimit * ratio)
                const label = ratio === 1 ? 'Full Amount' : `${ratio * 100}%`

                return (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAmount(String(chipValue))}
                    className="py-1.5 px-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-white/[0.02] hover:border-sky text-center transition-colors"
                  >
                    <span className="block text-[11px] font-bold text-cocoa dark:text-white">{label}</span>
                    <span className="block text-[10px] text-text-light-muted dark:text-text-dark-muted">
                      {formatKES(chipValue)}
                    </span>
                  </button>
                )
              })}
            </div>

            {overLimit && (
              <div className="mt-3 p-2.5 rounded-[4px] bg-coral/10 border border-coral/30 flex items-center gap-2 text-[11px] text-coral font-medium">
                <AlertCircle size={14} className="shrink-0" />
                <span>
                  Amount exceeds available limit of {formatKES(anchor.availableLimit)}. Please reduce the requested
                  amount.
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              full
              disabled={amountNum <= 0 || overLimit}
              onClick={() => setStep(2)}
            >
              Continue to Tenor & Purpose <ArrowRight size={14} className="ml-1 inline" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Tenor (strictly anchor-allowed) + Purpose */}
      {step === 2 && anchor && (
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-[15px] font-bold text-cocoa dark:text-text-dark-primary">
              3. Tenor & Purpose
            </h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Select an allowed repayment period and indicate the business purpose for this order.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cocoa dark:text-text-dark-primary uppercase tracking-wide mb-1.5">
              Anchor-Approved Repayment Tenor
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {allowedTenors.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTenor(t)}
                  className={`py-2 px-3 rounded-[4px] border text-center transition-colors ${
                    tenor === t
                      ? 'border-sky bg-sky text-cocoa font-bold shadow-none'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary hover:border-sky/40'
                  }`}
                >
                  <span className="block text-[13px]">{t} Days</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted mt-1.5">
              Due Date for this drawdown:{' '}
              <span className="font-semibold text-cocoa dark:text-white">{breakdown.dueDateFormatted}</span>
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cocoa dark:text-text-dark-primary uppercase tracking-wide mb-1.5">
              Order Financing Purpose
            </label>
            <div className="space-y-2">
              {PURPOSES.map((p) => (
                <label
                  key={p}
                  className={`flex items-center gap-3 p-2.5 rounded-[4px] border cursor-pointer transition-colors ${
                    purpose === p
                      ? 'border-sky bg-sky-tint/15 dark:bg-sky/10 font-semibold text-cocoa dark:text-white'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary hover:border-sky/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="drawdown-purpose"
                    checked={purpose === p}
                    onChange={() => setPurpose(p)}
                    className="accent-cocoa"
                  />
                  <span className="text-[12px]">{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button full onClick={() => setStep(3)}>
              Review Facility Terms <ArrowRight size={14} className="ml-1 inline" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 3 && anchor && (
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="text-[15px] font-bold text-cocoa dark:text-text-dark-primary">
              4. Review & Authorization
            </h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Confirm order details prior to mandate execution.
            </p>
          </div>

          <div className="p-3.5 rounded-[4px] bg-surface-light dark:bg-white/[0.02] border border-surface-border dark:border-surface-dark-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Corporate Anchor:</span>
              <span className="font-semibold text-cocoa dark:text-white">{anchor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Collection Account:</span>
              <span className="font-mono text-cocoa dark:text-white">
                {anchor.collectionAccountNumber || '1002450091'} (NCBA)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Order Amount:</span>
              <span className="font-bold text-cocoa dark:text-white">{formatKES(amountNum)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Repayment Tenor:</span>
              <span className="font-semibold text-cocoa dark:text-white">
                {tenor} Days (Due {breakdown.dueDateFormatted})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Financing Purpose:</span>
              <span className="font-medium text-cocoa dark:text-white">{purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Signing Mandate:</span>
              <span className="font-bold text-cocoa dark:text-sky">
                {customerMandate === 'SINGLE' ? 'Single Mandate (Instant)' : `Multi-Party Mandate (${customerMandate})`}
              </span>
            </div>
          </div>

          {isJoint ? (
            <div className="p-3 rounded-[4px] bg-sun/15 border border-sun/30 text-xs text-cocoa dark:text-text-dark-primary flex items-start gap-2">
              <Users size={16} className="text-cocoa dark:text-sun shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Multi-Party Authorization Required</p>
                <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                  Submitting will dispatch secure SMS review links to your designated directors/partners. Once approved,
                  funds disburse directly to {anchor.name}'s collection account.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/20 text-xs text-cocoa dark:text-text-dark-primary flex items-start gap-2">
              <ShieldCheck size={16} className="text-mediterranean shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-cocoa dark:text-white">Sole Proprietor Instant Settlement</p>
                <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                  Your mandate is configured for immediate disbursement upon confirmation.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setStep(2)} disabled={submitting}>
              Back
            </Button>
            <Button full onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Processing Drawdown…' : isJoint ? 'Submit for Signatory Approval' : 'Authorize & Disburse Instantly'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )

  return (
    <AppShell title="Draw Down Facility" back>
      <FormLayout
        title="NCBA BOOSTA Drawdown"
        subtitle="Finance supplier stock purchases with transparent pricing and direct anchor settlement."
        left={leftForm}
        right={rightBreakdownPanel}
      />

      {showCrbModal && anchor && (
        <CRBRestrictionModal
          anchorName={anchor.name}
          limit={anchor.approvedLimit}
          onClose={() => setShowCrbModal(false)}
        />
      )}
    </AppShell>
  )
}
