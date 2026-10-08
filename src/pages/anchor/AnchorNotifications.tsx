import { useState } from 'react'
import { Bell, Mail, Archive, X } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatDateTime } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'
import type { AnchorNotification, AnchorNotificationCategory } from '../../types'

const categoryLabel: Record<AnchorNotificationCategory, string> = {
  REVIEW_REMINDER: 'Review reminder',
  SUBMISSION_UPDATE: 'Submission update',
  DOCUMENT_REQUEST: 'Document request',
  NCBA_COMMUNICATION: 'NCBA communication',
  SYSTEM: 'System',
  PERFORMANCE: 'Performance',
}

type Tab = 'unread' | 'read' | 'archived'

export default function AnchorNotifications() {
  const { notifications, loading, setNotificationState } = useAnchorPortal()
  const [tab, setTab] = useState<Tab>('unread')
  const [emailPreview, setEmailPreview] = useState<AnchorNotification | null>(null)

  const filtered = notifications.filter((n) => n.state === tab)
  const counts = {
    unread: notifications.filter((n) => n.state === 'unread').length,
    read: notifications.filter((n) => n.state === 'read').length,
    archived: notifications.filter((n) => n.state === 'archived').length,
  }

  function open(n: AnchorNotification) {
    if (n.state === 'unread') setNotificationState(n.id, 'read')
  }

  return (
    <AnchorShell title="Notifications">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={18} className="text-cocoa dark:text-sky" />
        <p className="text-sm text-text-light-muted dark:text-text-dark-muted">Review reminders, submission updates, and NCBA communications.</p>
      </div>

      <div className="flex gap-2 mb-4">
        {(['unread', 'read', 'archived'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-[4px] text-xs font-semibold capitalize border flex items-center gap-1.5 transition-colors ${
              tab === t
                ? 'bg-sky text-cocoa border-sky'
                : 'bg-surface-light dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border'
            }`}
          >
            {t}
            {counts[t] > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${tab === t ? 'bg-cocoa/20 text-cocoa' : 'bg-black/5 dark:bg-white/10'}`}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title={`No ${tab} notifications`} detail="You're all caught up here." />
      ) : (
        <Card className="p-4 max-w-2xl">
          {filtered.map((n) => (
            <div key={n.id} className="flex gap-3 py-3 border-b border-surface-border dark:border-surface-dark-border last:border-0">
              <button onClick={() => open(n)} className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15 px-1.5 py-0.5 rounded-[3px]">
                    {categoryLabel[n.category]}
                  </span>
                  {n.state === 'unread' && <span className="w-2 h-2 rounded-full bg-sky" />}
                </div>
                <p className="text-sm font-semibold text-cocoa dark:text-white mt-1">{n.title}</p>
                <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-1">{formatDateTime(n.date)}</p>
              </button>
              <div className="flex flex-col gap-2 shrink-0">
                {n.emailSimulated && (
                  <button onClick={() => setEmailPreview(n)} className="text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-sky" title="View email">
                    <Mail size={15} />
                  </button>
                )}
                {n.state !== 'archived' && (
                  <button onClick={() => setNotificationState(n.id, 'archived')} className="text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white" title="Archive">
                    <Archive size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {emailPreview && (
        <Modal title="Email preview" onClose={() => setEmailPreview(null)}>
          <div className="border border-surface-border dark:border-surface-dark-border rounded-[6px] overflow-hidden">
            <div className="bg-black/[0.02] dark:bg-white/[0.02] px-4 py-3 border-b border-surface-border dark:border-surface-dark-border">
              <p className="text-xs text-text-light-muted dark:text-text-dark-muted">To: {emailPreview && 'grace.wanjiru@eabl.co.ke'}</p>
              <p className="text-sm font-bold text-cocoa dark:text-white mt-1">{emailPreview.emailSubject}</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">{emailPreview.emailBody}</p>
            </div>
          </div>
          <button onClick={() => setEmailPreview(null)} className="w-full flex items-center justify-center gap-1.5 text-xs text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white mt-3 transition-colors">
            <X size={12} /> Close preview
          </button>
        </Modal>
      )}
    </AnchorShell>
  )
}
