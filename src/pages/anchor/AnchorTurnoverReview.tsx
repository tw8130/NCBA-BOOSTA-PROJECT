import { useState } from 'react'
import { FileBarChart2 } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { ProgressIndicator, type TimelineStep } from '../../components/ui/ProgressIndicator'
import { DocumentUploader, type DocStatus } from '../../components/domain/DocumentUploader'
import { turnoverReviewStatusMeta } from '../../lib/status'
import { formatDate } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'
import { anchorApi } from '../../services/anchorApi'

const REQUIRED_DOCS = ['Annual financial statements', 'Annual turnover report', 'Management accounts', 'Supporting trading documentation']

const REMINDERS = [
  { days: 30, text: 'Your annual BOOSTA turnover review is due in 30 days.' },
  { days: 14, text: 'Reminder: your annual BOOSTA turnover review is due in 14 days.' },
  { days: 7, text: 'Your annual BOOSTA turnover review is due in 7 days.' },
  { days: 0, text: 'Your annual BOOSTA turnover review is due today.' },
]

export default function AnchorTurnoverReview() {
  const { turnoverReview, loading, refresh } = useAnchorPortal()
  const [docStatuses, setDocStatuses] = useState<Record<string, DocStatus>>({})
  const [submitting, setSubmitting] = useState(false)

  if (loading || !turnoverReview) {
    return (
      <AnchorShell title="Annual Turnover Review">
        <LoadingState />
      </AnchorShell>
    )
  }

  const allUploaded = REQUIRED_DOCS.every((d) => docStatuses[d] === 'VERIFIED')
  const meta = turnoverReviewStatusMeta[turnoverReview.status]

  async function submit() {
    setSubmitting(true)
    await anchorApi.submitTurnoverReview(REQUIRED_DOCS)
    await refresh()
    setSubmitting(false)
  }

  const order = ['DUE_SOON', 'DOCUMENTS_UPLOADED', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED']
  const currentIndex = order.indexOf(turnoverReview.status)
  const steps: TimelineStep[] = [
    { label: 'Review period opened', detail: turnoverReview.period, state: 'done' },
    { label: 'Documents uploaded', state: currentIndex >= 1 ? 'done' : allUploaded ? 'current' : 'upcoming' },
    { label: 'Submitted to NCBA', detail: turnoverReview.submittedAt ? formatDate(turnoverReview.submittedAt) : undefined, state: currentIndex >= 2 ? 'done' : 'upcoming' },
    { label: 'Under review', state: currentIndex >= 3 ? (currentIndex === 3 ? 'current' : 'done') : 'upcoming' },
    { label: 'Outcome', state: currentIndex >= 4 ? 'done' : 'upcoming' },
  ]

  return (
    <AnchorShell title="Annual Turnover Review">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Review period</p>
                <p className="font-bold text-cocoa dark:text-white text-lg">{turnoverReview.period}</p>
              </div>
              <StatusBadge label={meta.label} tone={meta.tone} />
            </div>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted">
              Due {formatDate(turnoverReview.dueDate)}
            </p>
          </Card>

          {(turnoverReview.status === 'DUE_SOON' || turnoverReview.status === 'OVERDUE') && (
            <Card className="p-4">
              <p className="text-sm font-semibold text-cocoa dark:text-white mb-1">Upload turnover documentation</p>
              <p className="text-xs text-text-light-muted dark:text-text-dark-muted mb-4">All four documents are required before you can submit.</p>
              {REQUIRED_DOCS.map((d) => (
                <DocumentUploader key={d} label={d} onStatusChange={(s) => setDocStatuses((p) => ({ ...p, [d]: s }))} />
              ))}
              <Button full className="mt-2" disabled={!allUploaded || submitting} onClick={submit}>
                {submitting ? 'Submitting…' : 'Submit for NCBA review'}
              </Button>
            </Card>
          )}

          {turnoverReview.status === 'SUBMITTED' || turnoverReview.status === 'UNDER_REVIEW' ? (
            <Card className="p-4 bg-sky-tint dark:bg-sky/15 border-sky/30">
              <p className="text-sm text-cocoa dark:text-white">
                Your submission is with the NCBA credit team. You'll be notified here — and by email — the moment there's an update.
              </p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Status</p>
            <ProgressIndicator steps={steps} />
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileBarChart2 size={16} className="text-cocoa dark:text-sky" />
              <p className="text-sm font-semibold text-cocoa dark:text-white">Reminder schedule</p>
            </div>
            <div className="space-y-2">
              {REMINDERS.map((r) => (
                <div key={r.days} className="text-xs text-text-light-secondary dark:text-text-dark-secondary bg-black/[0.02] dark:bg-white/[0.02] border border-surface-border dark:border-surface-dark-border rounded-[4px] px-3 py-2">
                  {r.text}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AnchorShell>
  )
}
