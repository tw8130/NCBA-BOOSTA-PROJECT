import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { AnchorCard } from '../../components/domain/AnchorCard'
import { CRBRestrictionModal } from '../../components/domain/CRBRestrictionModal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Stepper } from '../../components/ui/Stepper'
import { LoadingState } from '../../components/ui/LoadingState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatKES } from '../../lib/format'
import { applicationStatusMeta, declineReasonCopy } from '../../lib/status'
import { useApp } from '../../context/AppContext'
import { api } from '../../services/api'
import type { LoanApplication } from '../../types'

const STEPS = ['Anchor', 'Amount', 'Tenor & purpose', 'Review']
const PURPOSES = ['Stock purchase', 'Restocking ahead of season', 'Bridging a large order']
const TENORS = [7, 14, 30, 60, 90]

export default function Drawdown() {
  const navigate = useNavigate()
  const { anchors, loans, refresh } = useApp()
  const [params] = useSearchParams()
  const preselected = params.get('anchor')

  const [step, setStep] = useState(0)
  const [anchorId, setAnchorId] = useState<string | null>(preselected)
  const [amount, setAmount] = useState('')
  const [tenor, setTenor] = useState(30)
  const [purpose, setPurpose] = useState(PURPOSES[0])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<LoanApplication | null>(null)
  const [showCrbModal, setShowCrbModal] = useState(false)

  useEffect(() => {
    if (preselected) setStep(1)
  }, [preselected])

  const anchor = anchors.find((a) => a.id === anchorId)
  const amountNum = Number(amount.replace(/,/g, '')) || 0
  const overLimit = anchor ? amountNum > anchor.availableLimit : false
  const activeLoansHere = anchor ? loans.filter((l) => l.anchorId === anchor.id && l.status === 'ACTIVE').length : 0

  const processingFee = Math.round(amountNum * 0.035)
  const interest = Math.round(amountNum * 0.0038 * (tenor / 7))
  const insurance = Math.round(amountNum * 0.00011)
  const exciseDuty = Math.round(processingFee * 0.02)
  const disbursed = amountNum - processingFee - interest - insurance - exciseDuty
  const dueDate = new Date(Date.now() + tenor * 86400000)

  async function confirm() {
    if (!anchor) return
    setSubmitting(true)
    const application = await api.submitApplication({ anchorId: anchor.id, amount: amountNum, tenorDays: tenor, purpose })
    setResult(application)
    setSubmitting(false)
    if (application.status === 'UNDER_ASSESSMENT') {
      setTimeout(() => refresh(), 2600)
    } else {
      await refresh()
    }
  }

  if (submitting) {
    return (
      <AppShell title="Submitting" nav={false}>
        <LoadingState label="Submitting your drawdown request…" />
      </AppShell>
    )
  }

  if (result) {
    const meta = applicationStatusMeta[result.status]
    return (
      <AppShell title="Drawdown request" nav={false}>
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
              {result.status === 'DECLINED' ? (
                <XCircle className="text-coral" size={30} />
              ) : result.status === 'UNDER_ASSESSMENT' ? (
                <Clock className="text-cocoa dark:text-sun" size={30} />
              ) : (
                <CheckCircle2 className="text-mediterranean" size={30} />
              )}
            </div>
            <StatusBadge label={meta.label} tone={meta.tone} />
            <p className="text-2xl font-bold text-cocoa dark:text-white mt-2">{formatKES(result.requestedAmount)}</p>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted">{anchor?.name} · {result.reference}</p>

            {result.status === 'DECLINED' && result.declineReason && (
              <div className="text-left bg-coral/10 border border-coral/30 rounded-[4px] p-3 mt-4">
                <p className="text-[12px] text-coral font-semibold mb-1">Drawdown not completed</p>
                <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary">{declineReasonCopy[result.declineReason]}</p>
              </div>
            )}
            {result.status === 'UNDER_ASSESSMENT' && (
              <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-4">We're finalising your credit assessment — this dashboard will update automatically in a moment.</p>
            )}
          </Card>
          <div className="mt-4 flex gap-3">
            <Button full variant="secondary" onClick={() => navigate('/customer/dashboard')}>Back to dashboard</Button>
            {result.status === 'DECLINED' && <Button full onClick={() => { setResult(null); setStep(1) }}>Try again</Button>}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Draw down" back>
      <div className="max-w-md">
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <div>
            <h2 className="font-semibold text-[15px] text-cocoa dark:text-text-dark-primary mb-1">Which anchor is this for?</h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mb-4">Choose the corporate supplier you are financing stock from.</p>
            <div className="space-y-2 mb-6">
              {anchors.map((a) => (
                <AnchorCard
                  key={a.id}
                  anchor={a}
                  activeLoanCount={loans.filter((l) => l.anchorId === a.id && l.status === 'ACTIVE').length}
                  selectable
                  selected={anchorId === a.id}
                  onClick={() => setAnchorId(a.id)}
                />
              ))}
            </div>
            <Button full disabled={!anchorId} onClick={() => setStep(1)}>Continue</Button>
          </div>
        )}

        {step === 1 && anchor && (
          <div>
            <h2 className="font-semibold text-[15px] text-cocoa dark:text-text-dark-primary mb-1">How much do you need?</h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mb-1">
              Available with {anchor.name}: <span className="font-semibold text-cocoa dark:text-white">{formatKES(anchor.availableLimit)}</span>
            </p>
            {activeLoansHere > 0 && (
              <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mb-4">
                You already have {activeLoansHere} active loan{activeLoansHere > 1 ? 's' : ''} here — you can still draw down more within your available limit.
              </p>
            )}

            {!anchor.drawdownAllowed ? (
              <>
                <Card className="p-4 mb-4 border-sun/40 bg-sun/15">
                  <p className="text-[12px] font-semibold text-cocoa mb-1">Drawdown temporarily unavailable</p>
                  <p className="text-[12px] text-text-light-secondary">
                    Your limit of {formatKES(anchor.approvedLimit)} is still valid, but drawdown is on hold pending resolution of an outstanding credit-reference issue.
                  </p>
                </Card>
                <Button full variant="secondary" onClick={() => setShowCrbModal(true)}>Why can't I draw down?</Button>
              </>
            ) : (
              <>
                {activeLoansHere === 0 && <div className="mb-4" />}
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-full text-2xl font-bold text-cocoa dark:text-text-dark-primary px-3 py-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border mb-2 bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky"
                />
                {overLimit && (
                  <p className="text-[11px] text-coral mb-3 font-medium">That's more than your available limit of {formatKES(anchor.availableLimit)}.</p>
                )}
                <div className="flex gap-2 mb-6">
                  {[0.25, 0.5, 1].map((f) => (
                    <button
                      key={f}
                      onClick={() => setAmount(String(Math.floor(anchor.availableLimit * f)))}
                      className="flex-1 py-1.5 rounded-[4px] bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky text-[11px] font-semibold border border-sky/30 hover:bg-sky/20 transition-colors"
                    >
                      {f === 1 ? 'Full amount' : `${f * 100}%`}
                    </button>
                  ))}
                </div>
                <Button full disabled={amountNum <= 0 || overLimit} onClick={() => setStep(2)}>Continue</Button>
              </>
            )}
          </div>
        )}

        {step === 2 && anchor && (
          <div>
            <h2 className="font-semibold text-[15px] text-cocoa dark:text-text-dark-primary mb-1">Tenor and purpose</h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mb-4">Choose a repayment period matching your trading inventory turnover.</p>

            <p className="text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-2">Repayment tenor</p>
            <div className="flex gap-2 mb-5 flex-wrap">
              {TENORS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTenor(t)}
                  className={`px-3.5 py-1.5 rounded-[4px] text-[12px] font-semibold border transition-colors ${
                    tenor === t
                      ? 'bg-sky text-cocoa border-sky'
                      : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-sky/40'
                  }`}
                >
                  {t} days
                </button>
              ))}
            </div>

            <p className="text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-2">Purpose</p>
            <div className="space-y-2 mb-6">
              {PURPOSES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-[4px] text-[12px] border transition-colors ${
                    purpose === p
                      ? 'bg-sky-tint dark:bg-sky/15 border-sky text-cocoa dark:text-white font-medium'
                      : 'bg-white dark:bg-surface-dark-paper border-surface-border dark:border-surface-dark-border text-text-light-secondary dark:text-text-dark-secondary hover:border-sky/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button full onClick={() => setStep(3)}>Review drawdown</Button>
          </div>
        )}

        {step === 3 && anchor && (
          <div>
            <p className="text-[11px] font-medium text-cocoa dark:text-sun bg-sun/20 border border-sun/40 rounded-[4px] px-3 py-2 mb-4">
              Indicative prototype data — rates shown are placeholders, not final NCBA pricing.
            </p>
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Requested amount</p>
                  <p className="text-2xl font-bold text-cocoa dark:text-white">{formatKES(amountNum)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Supplier</p>
                  <p className="font-semibold text-cocoa dark:text-white">{anchor.name}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-surface-border dark:border-surface-dark-border pt-3">
                <Row label="Processing fee" value={formatKES(processingFee)} />
                <Row label="Interest" value={formatKES(interest)} />
                <Row label="Insurance (credit life)" value={formatKES(insurance)} />
                <Row label="Excise duty" value={formatKES(exciseDuty)} />
                <Row label="Tenor" value={`${tenor} days`} />
                <Row label="Due date" value={dueDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <Row label="Purpose" value={purpose} />
              </div>
              <div className="border-t border-surface-border dark:border-surface-dark-border mt-3 pt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-cocoa dark:text-white">Amount to be disbursed</p>
                <p className="text-lg font-bold text-cocoa dark:text-white">{formatKES(disbursed)}</p>
              </div>
              <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-1">Paid directly to {anchor.name}'s NCBA account.</p>
            </Card>
            <Button full onClick={confirm}>Confirm drawdown</Button>
          </div>
        )}
      </div>

      {showCrbModal && anchor && (
        <CRBRestrictionModal anchorName={anchor.name} limit={anchor.approvedLimit} onClose={() => setShowCrbModal(false)} />
      )}
    </AppShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-light-muted dark:text-text-dark-muted">{label}</span>
      <span className="font-medium text-cocoa dark:text-white">{value}</span>
    </div>
  )
}
