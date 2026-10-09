import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Users,
  ShieldCheck,
  ChevronLeft,
  XCircle,
} from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatKES } from '../../lib/format'
import { calculateDrawdownBreakdown } from '../../lib/calculations'
import { api } from '../../services/api'
import type { DrawdownRequest, LoanTenorDays } from '../../types'

export default function DrawdownTracker() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [request, setRequest] = useState<DrawdownRequest | null>(null)
  const [loading, setLoading] = useState(true)

  // Rework adjustment state
  const [isEditing, setIsEditing] = useState(false)
  const [editAmount, setEditAmount] = useState('')
  const [editTenor, setEditTenor] = useState<LoanTenorDays>(30)
  const [editPurpose, setEditPurpose] = useState('')
  const [resubmitting, setResubmitting] = useState(false)

  useEffect(() => {
    async function fetchReq() {
      if (!id) return
      const req = await api.getDrawdownRequest(id)
      if (req) {
        setRequest(req)
        setEditAmount(String(req.amount))
        setEditTenor(req.tenorDays)
        setEditPurpose(req.purpose)
        if (req.status === 'REWORK_REQUESTED') {
          setIsEditing(true)
        }
      }
      setLoading(false)
    }

    fetchReq()
  }, [id])

  if (loading) {
    return (
      <AppShell title="Drawdown Status">
        <Card className="p-8 text-center">
          <Clock className="mx-auto text-sky animate-spin mb-2" size={24} />
          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
            Loading authorization progress…
          </p>
        </Card>
      </AppShell>
    )
  }

  if (!request) {
    return (
      <AppShell title="Not Found">
        <Card className="p-6 text-center space-y-3">
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
            Drawdown request could not be found.
          </p>
          <Button onClick={() => navigate('/customer/dashboard')}>Back to Dashboard</Button>
        </Card>
      </AppShell>
    )
  }

  const isRework = request.status === 'REWORK_REQUESTED'
  const isDisbursed = request.status === 'DISBURSED'
  const isRejected = request.status === 'REJECTED'

  async function handleResubmit() {
    if (!request) return
    const amountNum = Number(editAmount.replace(/[^\d]/g, ''))
    if (amountNum <= 0) return

    setResubmitting(true)
    try {
      const updated = await api.resubmitDrawdown(request.id, {
        amount: amountNum,
        tenorDays: editTenor,
        purpose: editPurpose,
      })
      setRequest(updated)
      setIsEditing(false)
    } finally {
      setResubmitting(false)
    }
  }

  return (
    <AppShell title={`Drawdown ${request.reference}`} back>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-cocoa dark:text-white">
              Drawdown Request Tracker
            </h1>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary">
              Reference: <span className="font-mono font-semibold">{request.reference}</span>
            </p>
          </div>
          <StatusBadge
            label={request.status}
            tone={
              isDisbursed
                ? 'success'
                : isRework
                ? 'warning'
                : isRejected
                ? 'danger'
                : 'neutral'
            }
          />
        </div>

        {/* Status Callout Banner */}
        {isRework && (
          <Card className="p-4 border-sun/40 bg-sun/15 space-y-2">
            <div className="flex items-center gap-2 text-cocoa font-bold text-[13px]">
              <RotateCcw size={16} /> Rework Requested by Signatory
            </div>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
              A director requested amendments before approving this facility:{' '}
              <span className="font-semibold text-cocoa dark:text-white">"{request.reworkNotes}"</span>
            </p>
            <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
              Adjust the amount, tenor, or purpose below and resubmit to trigger refreshed SMS approval tokens.
            </p>
          </Card>
        )}

        {isDisbursed && (
          <Card className="p-4 border-mediterranean/30 bg-mediterranean/10 space-y-1">
            <div className="flex items-center gap-2 text-mediterranean font-bold text-[13px]">
              <CheckCircle2 size={16} /> Drawdown Approved & Disbursed
            </div>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary">
              All required directors have authorized this transaction. Funds were sent directly to the anchor
              collection account.
            </p>
          </Card>
        )}

        {/* Terms Card or Rework Editor Form */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <h3 className="text-[14px] font-bold text-cocoa dark:text-white">Order Facility Terms</h3>
            {isRework && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[11px] font-semibold text-sky hover:underline"
              >
                Edit Terms
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-cocoa dark:text-white uppercase mb-1">
                  Adjusted Order Amount (KES)
                </label>
                <input
                  type="text"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full text-lg font-bold px-3 py-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-cocoa dark:text-white uppercase mb-1">
                  Repayment Tenor
                </label>
                <div className="flex gap-2">
                  {[7, 14, 30, 60, 90].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditTenor(t as LoanTenorDays)}
                      className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold border ${
                        editTenor === t
                          ? 'border-sky bg-sky text-cocoa'
                          : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary'
                      }`}
                    >
                      {t}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-cocoa dark:text-white uppercase mb-1">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  value={editPurpose}
                  onChange={(e) => setEditPurpose(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={resubmitting}>
                  Cancel
                </Button>
                <Button full onClick={handleResubmit} disabled={resubmitting}>
                  {resubmitting ? 'Resubmitting…' : 'Resubmit for Signatory Approval'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-text-light-muted dark:text-text-dark-muted block">Requested Principal</span>
                <span className="font-bold text-cocoa dark:text-white text-sm">{formatKES(request.amount)}</span>
              </div>
              <div>
                <span className="text-text-light-muted dark:text-text-dark-muted block">Repayment Tenor</span>
                <span className="font-semibold text-cocoa dark:text-white">{request.tenorDays} Days</span>
              </div>
              <div>
                <span className="text-text-light-muted dark:text-text-dark-muted block">Initiator</span>
                <span className="font-medium text-cocoa dark:text-white">{request.initiatedBy}</span>
              </div>
              <div>
                <span className="text-text-light-muted dark:text-text-dark-muted block">Mandate Rule</span>
                <span className="font-medium text-cocoa dark:text-white">{request.mandateType || 'JOINT_ALL'}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Signatory Progress Tracker */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <h3 className="text-[14px] font-bold text-cocoa dark:text-white flex items-center gap-1.5">
              <Users size={16} className="text-sky" /> Signatory Authorizations
            </h3>
            <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
              {request.approvals.filter((a) => a.status === 'APPROVED').length} of {request.approvals.length} signed
            </span>
          </div>

          <div className="space-y-2.5">
            {request.approvals.map((app) => (
              <div
                key={app.token}
                className="p-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-cocoa dark:text-white">{app.signatoryName}</span>
                    <StatusBadge
                      label={app.status === 'APPROVED' ? 'Approved & Signed' : app.status}
                      tone={
                        app.status === 'APPROVED'
                          ? 'success'
                          : app.status === 'REWORK_REQUESTED'
                          ? 'warning'
                          : 'neutral'
                      }
                    />
                  </div>
                  {app.comments && (
                    <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary italic mt-1">
                      "{app.comments}"
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-text-light-muted dark:text-text-dark-muted mt-0.5">
                    Token: {app.token}
                  </p>
                </div>

                {/* Direct Simulator Link */}
                <a
                  href={`/signatory/review/${app.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-sky text-cocoa text-[11px] font-semibold hover:bg-sky-hover transition-colors shrink-0"
                >
                  <ExternalLink size={12} /> Test Signatory Review
                </a>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" full onClick={() => navigate('/customer/dashboard')}>
            Dashboard
          </Button>
          <Button full onClick={() => navigate('/customer/loans')}>
            My Loans
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
