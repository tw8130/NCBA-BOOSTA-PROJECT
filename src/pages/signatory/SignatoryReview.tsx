import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  RotateCcw,
  Building,
  Calendar,
  Layers,
} from 'lucide-react'
import { SignatoryShell } from '../../components/layout/SignatoryShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { SignaturePad } from '../../components/domain/SignaturePad'
import { OTPInput } from '../../components/domain/OTPInput'
import { formatKES } from '../../lib/format'
import { calculateDrawdownBreakdown } from '../../lib/calculations'
import { api } from '../../services/api'
import type { DrawdownRequest } from '../../types'

type ReviewAction = 'VIEW' | 'SIGN' | 'REWORK' | 'DECLINE'

export default function SignatoryReview() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [tokenStatus, setTokenStatus] = useState<'VALID' | 'USED' | 'EXPIRED' | 'NOT_FOUND'>('VALID')
  const [request, setRequest] = useState<DrawdownRequest | null>(null)
  const [approvalSlot, setApprovalSlot] = useState<DrawdownRequest['approvals'][0] | null>(null)

  // Step state: 0 = OTP Verification, 1 = Terms Review & Action
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)

  // Action flow
  const [currentAction, setCurrentAction] = useState<ReviewAction>('VIEW')
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [reworkNotes, setReworkNotes] = useState('')
  const [declineReason, setDeclineReason] = useState('Unauthorized transaction amount')
  const [declineNotes, setDeclineNotes] = useState('')
  const [actionSubmitted, setActionSubmitted] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadTokenData() {
      if (!token) {
        setTokenStatus('NOT_FOUND')
        setLoading(false)
        return
      }

      const res = await api.getDrawdownByToken(token)
      setTokenStatus(res.tokenStatus)
      if (res.request) setRequest(res.request)
      if (res.approval) setApprovalSlot(res.approval)
      setLoading(false)
    }

    loadTokenData()
  }, [token])

  function handleVerifyOtp() {
    // Demo OTP check: accept 123456 or any 6 digits in demo mode
    if (otpCode.length === 6) {
      setOtpVerified(true)
      setOtpError(null)
    } else {
      setOtpError('Please enter the 6-digit verification code sent to your phone.')
    }
  }

  async function handleApproveAndSign() {
    if (!signatureData || !request || !token) return
    setSubmitting(true)
    try {
      const res = await api.approveSignatoryDrawdown(request.id, token, signatureData)
      setRequest(res.drawdownRequest)
      setActionSubmitted('APPROVED')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRequestRework() {
    if (!reworkNotes.trim() || !request || !token) return
    setSubmitting(true)
    try {
      const res = await api.reworkSignatoryDrawdown(request.id, token, reworkNotes)
      setRequest(res)
      setActionSubmitted('REWORK')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDecline() {
    if (!request || !token) return
    setSubmitting(true)
    const combinedReason = `${declineReason}${declineNotes ? `: ${declineNotes}` : ''}`
    try {
      const res = await api.declineSignatoryDrawdown(request.id, token, combinedReason)
      setRequest(res)
      setActionSubmitted('DECLINED')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <SignatoryShell title="Loading Review…">
        <Card className="p-8 text-center">
          <Clock className="mx-auto text-sky animate-spin mb-2" size={24} />
          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
            Verifying secure authorization link…
          </p>
        </Card>
      </SignatoryShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Expired / Used / Not Found States
  // ---------------------------------------------------------------------------
  if (tokenStatus !== 'VALID' || !request) {
    return (
      <SignatoryShell title="Link Unavailable" tokenValid={false}>
        <Card className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-coral/10 text-coral border border-coral/20">
            <XCircle size={32} />
          </div>

          <div>
            <h2 className="text-[16px] font-bold text-cocoa dark:text-white">
              {tokenStatus === 'EXPIRED'
                ? 'Authorization Link Expired'
                : tokenStatus === 'USED'
                ? 'Link Already Utilized'
                : 'Invalid Review Token'}
            </h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-1 max-w-sm mx-auto leading-relaxed">
              {tokenStatus === 'EXPIRED' &&
                'This single-use SMS review link has exceeded its 72-hour security window. Please request a refreshed authorization token from the facility initiator.'}
              {tokenStatus === 'USED' &&
                `This drawdown authorization has already been signed or updated (Status: ${
                  approvalSlot?.status || request?.status
                }). No further action is required.`}
              {tokenStatus === 'NOT_FOUND' &&
                'The token could not be found. Please check your SMS invitation link or contact NCBA support.'}
            </p>
          </div>

          <div className="pt-2">
            <Button
              full
              variant="secondary"
              onClick={() => {
                // If demo user wants to reset token to valid for testing
                setTokenStatus('VALID')
                setOtpVerified(true)
              }}
            >
              Demo: Re-activate Token for Testing
            </Button>
          </div>
        </Card>
      </SignatoryShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Success / Action Completed Screen
  // ---------------------------------------------------------------------------
  if (actionSubmitted) {
    return (
      <SignatoryShell title="Decision Recorded">
        <Card className="p-6 text-center space-y-4">
          <div
            className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center border ${
              actionSubmitted === 'APPROVED'
                ? 'bg-mediterranean/10 text-mediterranean border-mediterranean/20'
                : actionSubmitted === 'REWORK'
                ? 'bg-sun/20 text-cocoa dark:text-sun border-sun/30'
                : 'bg-coral/10 text-coral border-coral/20'
            }`}
          >
            {actionSubmitted === 'APPROVED' ? (
              <CheckCircle2 size={32} />
            ) : actionSubmitted === 'REWORK' ? (
              <RotateCcw size={30} />
            ) : (
              <XCircle size={32} />
            )}
          </div>

          <div>
            <h2 className="text-[17px] font-bold text-cocoa dark:text-white">
              {actionSubmitted === 'APPROVED'
                ? 'Drawdown Authorized & Signed'
                : actionSubmitted === 'REWORK'
                ? 'Rework Request Dispatched'
                : 'Drawdown Declined'}
            </h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
              {actionSubmitted === 'APPROVED' &&
                `Your digital signature has been verified and recorded. If all required signatories have signed, KES ${request.amount.toLocaleString()} will disburse immediately to the anchor collection account.`}
              {actionSubmitted === 'REWORK' &&
                `Your revision notes ("${reworkNotes}") have been returned to ${request.initiatedBy}. They can modify order terms and submit for re-authorization.`}
              {actionSubmitted === 'DECLINED' &&
                `You have declined this facility drawdown. The application has been marked rejected in the audit trail.`}
            </p>
          </div>

          <div className="p-3 bg-surface-light dark:bg-white/[0.02] border border-surface-border dark:border-surface-dark-border rounded-[4px] text-xs font-mono text-left space-y-1">
            <p className="text-text-light-muted dark:text-text-dark-muted">
              Reference: <span className="font-bold text-cocoa dark:text-white">{request.reference}</span>
            </p>
            <p className="text-text-light-muted dark:text-text-dark-muted">
              Signatory: <span className="font-semibold text-cocoa dark:text-white">{approvalSlot?.signatoryName}</span>
            </p>
            <p className="text-text-light-muted dark:text-text-dark-muted">
              Timestamp: {new Date().toLocaleString('en-KE')}
            </p>
          </div>

          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
            You may safely close this browser window. An SMS confirmation has been sent to your registered number.
          </p>
        </Card>
      </SignatoryShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Step 1: Director OTP Verification
  // ---------------------------------------------------------------------------
  if (!otpVerified) {
    return (
      <SignatoryShell title="Signatory Security Verification">
        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sky/15 text-cocoa dark:text-sky flex items-center justify-center shrink-0 border border-sky/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-cocoa dark:text-white">
                Authenticate Signatory Identity
              </h2>
              <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5 leading-relaxed">
                Welcome, <span className="font-semibold text-cocoa dark:text-white">{approvalSlot?.signatoryName}</span>.
                Enter the 6-digit verification code sent via SMS to authorize review of order{' '}
                <span className="font-mono font-semibold">{request.reference}</span>.
              </p>
            </div>
          </div>

          <div className="py-2">
            <OTPInput
              value={otpCode}
              onChange={(val) => {
                setOtpCode(val)
                setOtpError(null)
                if (val.length === 6) {
                  setOtpVerified(true)
                }
              }}
            />
            {otpError && (
              <p className="text-[11px] text-coral font-medium mt-2 text-center">{otpError}</p>
            )}
          </div>

          <div className="p-2.5 rounded-[4px] bg-sky-tint/20 dark:bg-sky/10 border border-sky/30 flex items-center justify-between text-[11px]">
            <span className="text-cocoa dark:text-sky font-medium">Demo Testing Code: 123456</span>
            <button
              type="button"
              onClick={() => {
                setOtpCode('123456')
                setOtpVerified(true)
              }}
              className="text-sky font-bold hover:underline"
            >
              Fill & Continue
            </button>
          </div>

          <div className="pt-2">
            <Button full onClick={handleVerifyOtp} disabled={otpCode.length !== 6}>
              Verify & View Drawdown Details <ArrowRight size={14} className="ml-1 inline" />
            </Button>
          </div>
        </Card>
      </SignatoryShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Step 2: Terms Review & Action Selection
  // ---------------------------------------------------------------------------
  const calc = calculateDrawdownBreakdown({
    principal: request.amount,
    tenorDays: request.tenorDays,
  })

  return (
    <SignatoryShell title="Drawdown Authorization">
      <div className="space-y-4">
        {/* Drawdown Summary Card */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted font-bold uppercase">
                Facility Drawdown Request
              </span>
              <h2 className="text-[16px] font-extrabold text-cocoa dark:text-white">
                {formatKES(request.amount)}
              </h2>
            </div>
            <StatusBadge label={request.status} tone="warning" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-text-light-muted dark:text-text-dark-muted block">Initiated By</span>
              <span className="font-semibold text-cocoa dark:text-white">{request.initiatedBy}</span>
            </div>
            <div>
              <span className="text-text-light-muted dark:text-text-dark-muted block">Reference</span>
              <span className="font-mono font-semibold text-cocoa dark:text-white">{request.reference}</span>
            </div>
            <div>
              <span className="text-text-light-muted dark:text-text-dark-muted block">Repayment Tenor</span>
              <span className="font-semibold text-cocoa dark:text-white">
                {request.tenorDays} Days (Due {calc.dueDateFormatted})
              </span>
            </div>
            <div>
              <span className="text-text-light-muted dark:text-text-dark-muted block">Total Repayable</span>
              <span className="font-bold text-cocoa dark:text-white">{formatKES(calc.totalRepayable)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border text-xs">
            <span className="text-text-light-muted dark:text-text-dark-muted block">Financing Purpose</span>
            <span className="text-text-light-secondary dark:text-text-dark-secondary font-medium">
              {request.purpose}
            </span>
          </div>

          <div className="p-2.5 rounded-[4px] bg-surface-light dark:bg-white/[0.02] border border-surface-border dark:border-surface-dark-border text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Facility Fee (2.5%):</span>
              <span className="font-semibold">{formatKES(calc.facilityFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Pro-Rated Interest (17.1%):</span>
              <span className="font-semibold">{formatKES(calc.interest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light-muted dark:text-text-dark-muted">Net to Anchor Account:</span>
              <span className="font-bold text-mediterranean">{formatKES(calc.disbursedToAnchor)}</span>
            </div>
          </div>
        </Card>

        {/* Existing rework notes if any */}
        {request.reworkNotes && (
          <div className="p-3 bg-sun/20 border border-sun/40 rounded-[4px] text-xs space-y-1">
            <p className="font-bold text-cocoa">Previous Rework Feedback</p>
            <p className="text-text-light-secondary">{request.reworkNotes}</p>
          </div>
        )}

        {/* Signatory Progress Tracker */}
        <Card className="p-3.5 space-y-2">
          <p className="text-[11px] font-bold text-cocoa dark:text-text-dark-primary uppercase tracking-wide">
            Mandate Signatories ({request.mandateType || 'JOINT_ALL'})
          </p>
          <div className="space-y-1.5">
            {request.approvals.map((app) => (
              <div
                key={app.token}
                className="flex items-center justify-between text-xs py-1 border-b border-surface-border/50 dark:border-surface-dark-border/50 last:border-0"
              >
                <span className="text-cocoa dark:text-white font-medium">
                  {app.signatoryName}{' '}
                  {app.token === token && <span className="text-sky font-bold text-[10px]">(You)</span>}
                </span>
                <StatusBadge
                  label={app.status === 'APPROVED' ? 'Signed' : app.status}
                  tone={app.status === 'APPROVED' ? 'success' : app.status === 'REWORK_REQUESTED' ? 'warning' : 'neutral'}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Action Selector */}
        {currentAction === 'VIEW' && (
          <div className="space-y-2 pt-2">
            <Button full onClick={() => setCurrentAction('SIGN')}>
              <CheckCircle2 size={15} className="mr-1.5 inline text-mediterranean" /> Approve & Sign Drawdown
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setCurrentAction('REWORK')}>
                <RotateCcw size={14} className="mr-1 inline" /> Request Rework
              </Button>
              <Button variant="secondary" onClick={() => setCurrentAction('DECLINE')}>
                <XCircle size={14} className="mr-1 inline text-coral" /> Decline Order
              </Button>
            </div>
          </div>
        )}

        {/* Sub-Action: 1. Approve & Sign with Canvas */}
        {currentAction === 'SIGN' && (
          <Card className="p-4 space-y-3">
            <div>
              <h3 className="text-[14px] font-bold text-cocoa dark:text-white">
                Draw Your Authorized Digital Signature
              </h3>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                Sign below to authorize drawdown and execution of the facility terms.
              </p>
            </div>

            <SignaturePad onSave={(data) => setSignatureData(data)} onClear={() => setSignatureData(null)} />

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" full onClick={() => setCurrentAction('VIEW')} disabled={submitting}>
                Cancel
              </Button>
              <Button full disabled={!signatureData || submitting} onClick={handleApproveAndSign}>
                {submitting ? 'Submitting Signature…' : 'Confirm & Authorize'}
              </Button>
            </div>
          </Card>
        )}

        {/* Sub-Action: 2. Request Rework */}
        {currentAction === 'REWORK' && (
          <Card className="p-4 space-y-3">
            <div>
              <h3 className="text-[14px] font-bold text-cocoa dark:text-white">Request Rework</h3>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                Specify what changes you require (e.g., amount reduction or tenor change) before you can sign.
              </p>
            </div>

            <textarea
              rows={3}
              value={reworkNotes}
              onChange={(e) => setReworkNotes(e.target.value)}
              placeholder="e.g., Please reduce amount by KES 150,000 to match our warehouse delivery schedule."
              className="w-full text-xs p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky"
            />

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" full onClick={() => setCurrentAction('VIEW')} disabled={submitting}>
                Cancel
              </Button>
              <Button full disabled={!reworkNotes.trim() || submitting} onClick={handleRequestRework}>
                {submitting ? 'Sending Rework Notes…' : 'Send Back for Rework'}
              </Button>
            </div>
          </Card>
        )}

        {/* Sub-Action: 3. Decline Order */}
        {currentAction === 'DECLINE' && (
          <Card className="p-4 space-y-3">
            <div>
              <h3 className="text-[14px] font-bold text-coral">Decline Drawdown</h3>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                Declining will permanently reject this drawdown request. An audit record will be preserved.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-cocoa dark:text-text-dark-primary mb-1">
                Decline Reason
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full text-xs p-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky"
              >
                <option value="Unauthorized transaction amount">Unauthorized transaction amount</option>
                <option value="Supplier invoice discrepancy">Supplier invoice discrepancy</option>
                <option value="Budget ceiling reached">Budget ceiling reached</option>
                <option value="Duplicate order request">Duplicate order request</option>
                <option value="Other">Other business reason</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-cocoa dark:text-text-dark-primary mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                placeholder="Provide additional context for the initiator…"
                className="w-full text-xs p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" full onClick={() => setCurrentAction('VIEW')} disabled={submitting}>
                Cancel
              </Button>
              <Button full disabled={submitting} onClick={handleDecline}>
                {submitting ? 'Declining…' : 'Confirm Decline'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </SignatoryShell>
  )
}
