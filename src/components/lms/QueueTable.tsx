import { useState } from 'react'
import { Check, X, FileText, AlertCircle, History, ShieldAlert } from 'lucide-react'
import { formatKES, formatDateTime } from '../../lib/format'
import { StatusBadge } from '../ui/StatusBadge'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { AuditTrail } from './AuditTrail'
import { useLms } from '../../context/LmsContext'
import type { LmsLimitAmendmentRequest } from '../../types'

interface QueueTableProps {
  requests: LmsLimitAmendmentRequest[]
  onActionComplete?: () => void
}

export function QueueTable({ requests, onActionComplete }: QueueTableProps) {
  const { currentUser, approveLimitAmendment, rejectLimitAmendment, auditTrail } = useLms()
  const [selectedReq, setSelectedReq] = useState<LmsLimitAmendmentRequest | null>(null)
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [auditReqId, setAuditReqId] = useState<string | null>(null)

  function openAction(req: LmsLimitAmendmentRequest, type: 'APPROVE' | 'REJECT') {
    setSelectedReq(req)
    setActionType(type)
    setComments(
      type === 'APPROVE'
        ? 'Approved per Delegated Lending Authority (DLA) limits. Risk covenants satisfactory.'
        : 'Declined: Debt service coverage ratio insufficient for proposed facility limit.'
    )
    setError(null)
  }

  async function handleConfirm() {
    if (!selectedReq || !actionType) return
    if (!comments.trim()) {
      setError('Comments are mandatory for Maker-Checker credit committee decisions.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      if (actionType === 'APPROVE') {
        await approveLimitAmendment(selectedReq.id, comments)
      } else {
        await rejectLimitAmendment(selectedReq.id, comments)
      }
      setSelectedReq(null)
      setActionType(null)
      onActionComplete?.()
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to process decision.')
    } finally {
      setSubmitting(false)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-surface-dark-paper rounded-[6px] border border-surface-border dark:border-surface-dark-border">
        <Check size={28} className="mx-auto text-mediterranean mb-2" />
        <p className="text-sm font-bold text-cocoa dark:text-white">Checker Queue Cleared</p>
        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
          No pending credit limit amendments require approval at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border bg-black/[0.02] dark:bg-white/[0.02]">
            <th className="py-3 px-3 font-semibold">Ref / Date</th>
            <th className="py-3 px-3 font-semibold">Borrower & Anchor</th>
            <th className="py-3 px-3 font-semibold">Current Limit</th>
            <th className="py-3 px-3 font-semibold">Proposed Limit</th>
            <th className="py-3 px-3 font-semibold">Initiated By (Maker)</th>
            <th className="py-3 px-3 font-semibold">Status</th>
            <th className="py-3 px-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
          {requests.map((r) => {
            const isSelf = r.makerId === currentUser.id
            const isPending = r.status === 'PENDING_CHECKER'
            const increasePct = Math.round(
              ((r.proposedLimit - r.currentLimit) / r.currentLimit) * 100
            )

            return (
              <tr
                key={r.id}
                className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
              >
                {/* Ref & Date */}
                <td className="py-3 px-3 align-top">
                  <span className="font-mono font-semibold text-cocoa dark:text-white block">
                    {r.id}
                  </span>
                  <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted">
                    {formatDateTime(r.submittedAt)}
                  </span>
                </td>

                {/* Borrower & Anchor */}
                <td className="py-3 px-3 align-top">
                  <p className="font-bold text-cocoa dark:text-white">{r.customerName}</p>
                  <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted">
                    ID: {r.nationalId} • {r.anchorName}
                  </p>
                  <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-1 max-w-xs line-clamp-2">
                    {r.justification}
                  </p>
                  {r.justificationDocName && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-sky mt-1 hover:underline cursor-pointer">
                      <FileText size={11} /> {r.justificationDocName}
                    </span>
                  )}
                </td>

                {/* Current Limit */}
                <td className="py-3 px-3 align-top font-semibold text-text-light-secondary dark:text-text-dark-secondary">
                  {formatKES(r.currentLimit)}
                </td>

                {/* Proposed Limit */}
                <td className="py-3 px-3 align-top">
                  <span className="font-bold text-cocoa dark:text-white block">
                    {formatKES(r.proposedLimit)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      increasePct >= 0 ? 'text-mediterranean' : 'text-coral'
                    }`}
                  >
                    {increasePct >= 0 ? '+' : ''}
                    {increasePct}% ({formatKES(r.proposedLimit - r.currentLimit)})
                  </span>
                </td>

                {/* Maker */}
                <td className="py-3 px-3 align-top">
                  <span className="font-medium text-cocoa dark:text-white block">
                    {r.makerName}
                  </span>
                  <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted font-mono">
                    {r.makerId}
                  </span>
                  {isSelf && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-[2px] bg-sun/20 text-cocoa text-[9px] font-bold">
                      Your Request
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3 align-top">
                  <StatusBadge
                    label={
                      r.status === 'PENDING_CHECKER'
                        ? 'Pending Checker'
                        : r.status === 'APPROVED'
                        ? 'Approved'
                        : 'Rejected'
                    }
                    tone={
                      r.status === 'PENDING_CHECKER'
                        ? 'warning'
                        : r.status === 'APPROVED'
                        ? 'success'
                        : 'danger'
                    }
                  />
                  {r.checkerName && (
                    <p className="text-[9px] text-text-light-muted dark:text-text-dark-muted mt-1">
                      By: {r.checkerName}
                    </p>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {isPending ? (
                      isSelf ? (
                        <div
                          className="px-2 py-1 rounded-[3px] bg-sun/15 border border-sun/40 text-[10px] font-semibold text-cocoa flex items-center gap-1"
                          title="Under CBK Prudential Guidelines, an initiator cannot approve their own credit amendment request."
                        >
                          <ShieldAlert size={12} className="text-cocoa" />
                          <span>Maker ≠ Checker</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openAction(r, 'APPROVE')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-mediterranean text-white text-[11px] font-bold hover:bg-mediterranean-hover transition-colors shadow-xs"
                            title="Approve limit amendment"
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            onClick={() => openAction(r, 'REJECT')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-coral/10 text-coral border border-coral/30 text-[11px] font-bold hover:bg-coral hover:text-white transition-colors"
                            title="Reject limit amendment"
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </>
                      )
                    ) : null}

                    {/* View Audit Trail button */}
                    <button
                      onClick={() => setAuditReqId(r.id)}
                      className="p-1 rounded-[3px] text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="View immutable audit trail"
                    >
                      <History size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Decision Modal */}
      {selectedReq && actionType && (
        <Modal
          title={
            actionType === 'APPROVE'
              ? 'Approve Credit Limit Amendment'
              : 'Reject Credit Limit Amendment'
          }
          onClose={() => {
            setSelectedReq(null)
            setActionType(null)
          }}
        >
          <div className="space-y-3.5">
            <div className="p-3 rounded-[4px] bg-surface-light dark:bg-surface-dark-bg border border-surface-border dark:border-surface-dark-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-light-muted">Borrower:</span>
                <span className="font-bold text-cocoa dark:text-white">
                  {selectedReq.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted">Proposed Limit:</span>
                <span className="font-bold text-cocoa dark:text-white">
                  {formatKES(selectedReq.proposedLimit)} (was {formatKES(selectedReq.currentLimit)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted">Initiating Maker:</span>
                <span className="font-medium text-cocoa dark:text-white">
                  {selectedReq.makerName} ({selectedReq.makerId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted">Approving Checker:</span>
                <span className="font-bold text-mediterranean dark:text-sky">
                  {currentUser.name} ({currentUser.id})
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-cocoa dark:text-white mb-1">
                Credit Committee Decision Memo / Comments <span className="text-coral">*</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky leading-relaxed"
                placeholder="Enter mandatory audit rationale..."
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-[4px] bg-coral/10 border border-coral/30 flex items-start gap-2 text-xs text-coral">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-border dark:border-surface-dark-border">
              <button
                type="button"
                onClick={() => {
                  setSelectedReq(null)
                  setActionType(null)
                }}
                className="px-3 py-1.5 rounded-[4px] border border-surface-border text-xs text-text-light-muted hover:text-cocoa"
              >
                Cancel
              </button>
              <Button
                variant={actionType === 'APPROVE' ? 'primary' : 'danger'}
                disabled={submitting}
                onClick={handleConfirm}
              >
                {submitting
                  ? 'Recording decision…'
                  : actionType === 'APPROVE'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Audit Trail Modal */}
      {auditReqId && (
        <Modal
          title={`Audit History — Request ${auditReqId}`}
          onClose={() => setAuditReqId(null)}
        >
          <AuditTrail
            entries={auditTrail.filter((a) => a.requestId === auditReqId)}
          />
        </Modal>
      )}
    </div>
  )
}
