import { useState } from 'react'
import {
  FileBarChart2,
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  Send,
  Eye,
  RotateCcw,
  ShieldCheck,
  Download,
  Building2,
  Calendar,
} from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { ProgressIndicator, type TimelineStep } from '../../components/ui/ProgressIndicator'
import { DocumentUploader, type DocStatus } from '../../components/domain/DocumentUploader'
import { turnoverReviewStatusMeta } from '../../lib/status'
import { formatDate } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'
import type { TurnoverReviewStatus } from '../../types'

const REQUIRED_DOCS = [
  'Audited annual financial statements',
  'Certified annual turnover report',
  'Management accounts (Q1–Q4)',
  'Supporting distributor trading documentation',
]

interface EmailPreviewData {
  subject: string
  to: string
  from: string
  date: string
  body: string
  stage: string
}

const EMAIL_TEMPLATES: Record<string, EmailPreviewData> = {
  '30-day': {
    stage: '30 Days Prior',
    subject: 'NCBA BOOSTA — Annual Turnover Review Due in 30 Days',
    to: 'grace.wanjiru@eabl.co.ke',
    from: 'boosta.anchor@ncbagroup.com',
    date: '2026-08-20',
    body: 'Dear Partner,\n\nThis is an advance notice that your annual BOOSTA turnover review for EABL is scheduled for completion on 20 September 2026 (in 30 days).\n\nTo ensure uninterrupted financing limits for your distributor network, please compile your audited financial statements and annual trading accounts.\n\nYou can begin uploading your documentation directly within the BOOSTA Anchor Portal.\n\nWarm regards,\nNCBA Corporate Supply Chain Finance',
  },
  '14-day': {
    stage: '14 Days Prior',
    subject: 'Action Required: NCBA BOOSTA Annual Review Due in 14 Days',
    to: 'grace.wanjiru@eabl.co.ke',
    from: 'boosta.anchor@ncbagroup.com',
    date: '2026-09-06',
    body: 'Dear Partner,\n\nYour annual BOOSTA turnover assessment is due in 14 days on 20 September 2026.\n\nPlease log in to the Anchor Portal to upload the required turnover reports and management accounts. Prompt submission enables NCBA credit committee to maintain and potentially increase your approved network credit line.\n\nThank you for your partnership.\nNCBA BOOSTA Portfolio Operations',
  },
  '7-day': {
    stage: '7 Days Prior (Urgent)',
    subject: 'Urgent: NCBA BOOSTA Annual Turnover Review Due in 7 Days',
    to: 'grace.wanjiru@eabl.co.ke',
    from: 'boosta.credit@ncbagroup.com',
    date: '2026-09-13',
    body: 'Dear Partner,\n\nYour annual turnover review is due in 7 business days on 20 September 2026.\n\nFailure to submit required trading statements by the due date may cause automatic drawdown holds for pending retailer orders. Please upload your documents now to avoid disruption.\n\nNCBA Credit Risk Department',
  },
  'due-date': {
    stage: 'Due Date Notification',
    subject: 'NCBA BOOSTA — Annual Turnover Review Due Today',
    to: 'grace.wanjiru@eabl.co.ke',
    from: 'boosta.credit@ncbagroup.com',
    date: '2026-09-20',
    body: 'Dear Partner,\n\nToday (20 September 2026) is the deadline for your annual BOOSTA turnover review.\n\nPlease submit your documentation today to initiate NCBA credit assessment and prevent administrative holds.\n\nNCBA Bank Kenya PLC',
  },
}

export default function AnchorTurnoverReview() {
  const { turnoverReview, user, loading, refresh, setTurnoverReviewStatus } = useAnchorPortal()
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({})
  const [emailModal, setEmailModal] = useState<EmailPreviewData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading || !turnoverReview) {
    return (
      <AnchorShell title="Annual Turnover Review">
        <LoadingState />
      </AnchorShell>
    )
  }

  const allUploaded = REQUIRED_DOCS.every((d) => docStatuses[d] === 'VERIFIED')
  const meta = turnoverReviewStatusMeta[turnoverReview.status]

  // Map state machine stages into timeline steps
  const status = turnoverReview.status
  const isUnderReview = status === 'UNDER_NCBA_REVIEW' || status === 'UNDER_REVIEW'
  const isApproved = status === 'APPROVED'
  const isDeclined = status === 'DECLINED'
  const isRework = status === 'MORE_INFO_REQUIRED'
  const isSubmitted = status === 'SUBMITTED' || isUnderReview || isApproved || isDeclined || isRework

  const steps: TimelineStep[] = [
    {
      label: 'Review Scheduled',
      detail: `Due ${formatDate(turnoverReview.dueDate)}`,
      state: 'done',
    },
    {
      label: 'Documents Uploaded',
      detail: allUploaded || isSubmitted ? '4 of 4 verified' : 'Pending uploads',
      state: isSubmitted || allUploaded ? 'done' : 'current',
    },
    {
      label: 'Submitted to NCBA',
      detail: turnoverReview.submittedAt ? formatDate(turnoverReview.submittedAt) : undefined,
      state: isSubmitted ? 'done' : allUploaded ? 'current' : 'upcoming',
    },
    {
      label: 'Under NCBA Review',
      detail: 'Credit Committee',
      state: isApproved || isDeclined ? 'done' : isUnderReview || isRework ? 'current' : 'upcoming',
    },
    {
      label: isApproved ? 'Approved' : isDeclined ? 'Declined' : isRework ? 'Rework Required' : 'Credit Decision',
      detail: isApproved ? 'Facility Renewed' : isDeclined ? 'Limit Locked' : isRework ? 'More Info Needed' : undefined,
      state: isApproved || isDeclined || isRework ? 'done' : 'upcoming',
    },
  ]

  async function handleManualSubmit() {
    setIsSubmitting(true)
    await setTurnoverReviewStatus('SUBMITTED', { documents: REQUIRED_DOCS })
    setTimeout(async () => {
      await setTurnoverReviewStatus('UNDER_NCBA_REVIEW')
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <AnchorShell title="Annual Turnover Review">
      <div className="space-y-4 max-w-5xl">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 rounded-[6px] bg-cocoa text-white shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-sky">{user?.anchorName || 'Anchor'}</span>
              <span className="text-xs text-white/40">•</span>
              <span className="text-xs text-white/80">Turnover Audit Cycle</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Annual Turnover Review ({turnoverReview.period})
            </h1>
            <p className="text-xs text-white/70 mt-1">
              Annual regulatory reconciliation required to renew anchor supply-chain facility limits.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-white/60 block">Current Status</span>
            <div className="mt-1">
              <StatusBadge label={meta.label} tone={meta.tone} />
            </div>
            <span className="text-[10px] text-white/60 block mt-1 font-mono">
              Due Date: {formatDate(turnoverReview.dueDate)}
            </span>
          </div>
        </div>

        {/* State Machine Status Notification Callouts */}
        {isApproved && (
          <div className="p-4 rounded-[6px] bg-mediterranean/10 border border-mediterranean/30 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-mediterranean shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h3 className="font-bold text-mediterranean text-sm">
                Annual Turnover Review Approved
              </h3>
              <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                NCBA Credit Risk Committee has approved your FY2026 annual financial statement audit. Your overall ecosystem facility limit has been renewed and expanded to{' '}
                <span className="font-bold text-cocoa dark:text-white">
                  KES {(turnoverReview.newProposedLimit || 12_000_000).toLocaleString()}
                </span>.
              </p>
            </div>
          </div>
        )}

        {isRework && (
          <div className="p-4 rounded-[6px] bg-sun/20 border border-sun/40 flex items-start gap-3">
            <AlertTriangle size={20} className="text-cocoa dark:text-sun shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h3 className="font-bold text-cocoa dark:text-white text-sm">
                More Information Required by NCBA Reviewer
              </h3>
              <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                {turnoverReview.reviewerComments ||
                  'The credit evaluation team noted variance between certified turnover certificates and VAT statements. Please upload supplementary management accounts.'}
              </p>
              <div className="mt-3">
                <Button size="sm" onClick={() => setTurnoverReviewStatus('DOCUMENTS_UPLOADED')}>
                  Upload Requested Revisions
                </Button>
              </div>
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="p-4 rounded-[6px] bg-coral/10 border border-coral/30 flex items-start gap-3">
            <XCircle size={20} className="text-coral shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h3 className="font-bold text-coral text-sm">
                Turnover Review Not Approved
              </h3>
              <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                {turnoverReview.reviewerComments ||
                  'Your turnover declarations do not meet the minimum covenant coverage required for facility limit extension.'}
              </p>
              <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-2">
                Please contact your dedicated NCBA Relationship Manager to initiate a manual credit appeal.
              </p>
            </div>
          </div>
        )}

        {isUnderReview && (
          <div className="p-4 rounded-[6px] bg-sky-tint/30 dark:bg-sky/10 border border-sky/30 flex items-start gap-3">
            <Clock size={20} className="text-sky shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 text-xs">
              <h3 className="font-bold text-cocoa dark:text-white text-sm">
                Documentation Under NCBA Review
              </h3>
              <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                Your submitted financial statements and turnover filings are currently being examined by the NCBA Credit Risk Committee. Decision expected within 48 business hours.
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Main Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column: Document Uploaders & Upload History */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload Box (Only if not already decided/submitted) */}
            {(!isSubmitted || isRework) && (
              <Card className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-cocoa dark:text-white">
                    Submit Annual Verification Documents
                  </h2>
                  <span className="text-[11px] font-semibold text-sky">
                    4 Required Files
                  </span>
                </div>
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-4">
                  Upload audited statements in PDF format (up to 15MB each). All 4 files must be verified to submit:
                </p>

                <div className="space-y-2.5">
                  {REQUIRED_DOCS.map((docName) => (
                    <DocumentUploader
                      key={docName}
                      label={docName}
                      onStatusChange={(s) => setDocStatuses((prev) => ({ ...prev, [docName]: s }))}
                    />
                  ))}
                </div>

                <div className="pt-4">
                  <Button
                    full
                    disabled={!allUploaded || isSubmitting}
                    onClick={handleManualSubmit}
                  >
                    {isSubmitting
                      ? 'Submitting to NCBA Credit Team…'
                      : 'Submit for NCBA Credit Committee Review'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Document Upload History Table */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-mediterranean" />
                  <h3 className="text-sm font-bold text-cocoa dark:text-white">
                    Document Audit History
                  </h3>
                </div>
                <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                  NCBA Vault Sync
                </span>
              </div>

              <div className="divide-y divide-surface-border dark:divide-surface-dark-border text-xs">
                {REQUIRED_DOCS.map((doc, idx) => {
                  const isUploaded = isSubmitted || docStatuses[doc] === 'VERIFIED'
                  return (
                    <div key={doc} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-cocoa dark:text-white">{doc}</p>
                        <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
                          {isUploaded
                            ? `EABL_FY26_${doc.slice(0, 10).replace(/\s+/g, '_')}.pdf • 3.4 MB • Uploaded ${formatDate(new Date().toISOString())}`
                            : 'Pending submission'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          label={isUploaded ? 'Verified' : 'Pending'}
                          tone={isUploaded ? 'success' : 'neutral'}
                        />
                        {isUploaded && (
                          <button
                            onClick={() => alert(`Viewing document: ${doc}`)}
                            className="p-1 text-sky hover:text-sky-hover"
                            title="Preview file"
                          >
                            <Download size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* State Machine Transition Controls (Demo & Testing) */}
            <Card className="p-4 bg-surface-light dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-cocoa dark:text-white uppercase tracking-wider">
                  Turnover Review State Machine Controls (Demo)
                </p>
                <button
                  type="button"
                  onClick={() => setTurnoverReviewStatus('DUE_SOON')}
                  className="p-1 text-text-light-muted hover:text-cocoa transition-colors"
                  title="Reset state machine"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mb-3">
                Simulate each phase of the regulatory turnover review lifecycle:
              </p>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTurnoverReviewStatus('DUE_SOON')}
                  className="px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border bg-sun/20 text-cocoa border-sun/40"
                >
                  DUE_SOON
                </button>
                <button
                  type="button"
                  onClick={() => setTurnoverReviewStatus('DOCUMENTS_UPLOADED', { documents: REQUIRED_DOCS })}
                  className="px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border bg-sky/15 text-cocoa dark:text-sky border-sky/30"
                >
                  DOCUMENTS_UPLOADED
                </button>
                <button
                  type="button"
                  onClick={() => setTurnoverReviewStatus('SUBMITTED', { documents: REQUIRED_DOCS })}
                  className="px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border bg-sky text-cocoa border-sky"
                >
                  SUBMITTED
                </button>
                <button
                  type="button"
                  onClick={() => setTurnoverReviewStatus('UNDER_NCBA_REVIEW')}
                  className="px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border bg-mediterranean text-white border-mediterranean"
                >
                  UNDER_NCBA_REVIEW
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTurnoverReviewStatus('APPROVED', {
                      newProposedLimit: 12_500_000,
                      reviewerComments: 'Turnover audited. Limit expanded to KES 12.5M.',
                    })
                  }
                  className="px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border bg-mediterranean/20 text-mediterranean border-mediterranean/40"
                >
                  APPROVED
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTurnoverReviewStatus('MORE_INFO_REQUIRED', {
                      reviewerComments:
                        'Please attach Q3 management accounts signed by Chief Financial Officer.',
                    })
                  }
                  className="px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border bg-sun/30 text-cocoa border-sun/50"
                >
                  MORE_INFO_REQUIRED
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTurnoverReviewStatus('DECLINED', {
                      reviewerComments: 'Failed credit covenant test: 30% revenue drop.',
                    })
                  }
                  className="px-2.5 py-1 rounded-[3px] text-[11px] font-semibold border bg-coral/20 text-coral border-coral/40"
                >
                  DECLINED
                </button>
              </div>
            </Card>
          </div>

          {/* Right Column: Progress Stepper & 30/14/7-Day Reminder Banners */}
          <div className="space-y-4">
            {/* Progress Stepper */}
            <Card className="p-4 sm:p-5">
              <h3 className="text-sm font-bold text-cocoa dark:text-white mb-3">
                Review Progress Stepper
              </h3>
              <ProgressIndicator steps={steps} />
            </Card>

            {/* 30/14/7-Day Reminder Schedule Banners */}
            <Card className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Mail size={16} className="text-sky" />
                  <h3 className="text-sm font-bold text-cocoa dark:text-white">
                    Turnover Reminders
                  </h3>
                </div>
                <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted">
                  Multi-Channel Schedule
                </span>
              </div>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
                Automated notification schedule sent to the primary anchor contacts:
              </p>

              {/* Reminder Items */}
              <div className="space-y-2">
                {[
                  { id: '30-day', label: '30-Day Reminder', desc: 'Dispatched 30 days prior', sent: true },
                  { id: '14-day', label: '14-Day Reminder', desc: 'Dispatched 14 days prior', sent: true },
                  { id: '7-day', label: '7-Day Urgent Alert', desc: 'Dispatched 7 days prior', sent: false },
                  { id: 'due-date', label: 'Due Date Alert', desc: 'Dispatched on deadline date', sent: false },
                ].map((rem) => (
                  <div
                    key={rem.id}
                    className="p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-white/[0.02] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cocoa dark:text-white">{rem.label}</span>
                        <StatusBadge
                          label={rem.sent ? 'Dispatched' : 'Scheduled'}
                          tone={rem.sent ? 'success' : 'neutral'}
                        />
                      </div>
                      <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted block mt-0.5">
                        {rem.desc}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEmailModal(EMAIL_TEMPLATES[rem.id])}
                      className="px-2 py-1 rounded-[3px] bg-sky/15 hover:bg-sky/25 text-cocoa dark:text-sky text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Preview Email Content"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {emailModal && (
        <Modal
          title={`Email Preview: ${emailModal.stage}`}
          onClose={() => setEmailModal(null)}
        >
          <div className="space-y-3 text-xs">
            {/* Email Header */}
            <div className="p-3 bg-surface-light dark:bg-white/[0.03] border border-surface-border dark:border-surface-dark-border rounded-[4px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted font-semibold">From:</span>
                <span className="font-mono text-cocoa dark:text-white">{emailModal.from}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted font-semibold">To:</span>
                <span className="font-mono text-cocoa dark:text-white">{emailModal.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted font-semibold">Date:</span>
                <span className="text-cocoa dark:text-white">{emailModal.date}</span>
              </div>
              <div className="flex justify-between border-t border-surface-border dark:border-surface-dark-border pt-1.5">
                <span className="text-text-light-muted dark:text-text-dark-muted font-semibold">Subject:</span>
                <span className="font-bold text-cocoa dark:text-white">{emailModal.subject}</span>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-4 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper">
              <div className="whitespace-pre-line text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
                {emailModal.body}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button onClick={() => setEmailModal(null)}>Close Preview</Button>
            </div>
          </div>
        </Modal>
      )}
    </AnchorShell>
  )
}
