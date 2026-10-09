import { useState } from 'react'
import { Bell, Mail, Archive, ArchiveRestore, CheckCheck, X, Copy, Check, Filter } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatDateTime } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'
import type { AnchorNotification, AnchorNotificationCategory } from '../../types'

const categoryMeta: Record<AnchorNotificationCategory, { label: string; tone: string }> = {
  REVIEW_REMINDER: { label: 'Review Reminder', tone: 'bg-sun/20 text-cocoa dark:text-sun' },
  SUBMISSION_UPDATE: { label: 'Submission Update', tone: 'bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky' },
  DOCUMENT_REQUEST: { label: 'Document Request', tone: 'bg-coral/15 text-coral dark:text-coral' },
  NCBA_COMMUNICATION: { label: 'NCBA Communication', tone: 'bg-mediterranean/15 text-mediterranean dark:text-sky' },
  PERFORMANCE: { label: 'Portfolio Health', tone: 'bg-sky-tint dark:bg-sky/20 text-cocoa dark:text-sky' },
  SYSTEM: { label: 'System Notice', tone: 'bg-black/5 dark:bg-white/10 text-text-light-secondary dark:text-text-dark-secondary' },
}

type Tab = 'unread' | 'read' | 'archived'

export default function AnchorNotifications() {
  const { notifications, loading, setNotificationState, markAllNotificationsRead } = useAnchorPortal()
  const [tab, setTab] = useState<Tab>('unread')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AnchorNotificationCategory>('ALL')
  const [emailPreview, setEmailPreview] = useState<AnchorNotification | null>(null)
  const [copied, setCopied] = useState(false)

  const tabFiltered = notifications.filter((n) => n.state === tab)
  const filtered = tabFiltered.filter(
    (n) => categoryFilter === 'ALL' || n.category === categoryFilter
  )

  const counts = {
    unread: notifications.filter((n) => n.state === 'unread').length,
    read: notifications.filter((n) => n.state === 'read').length,
    archived: notifications.filter((n) => n.state === 'archived').length,
  }

  function handleOpen(n: AnchorNotification) {
    if (n.state === 'unread') {
      setNotificationState(n.id, 'read')
    }
    if (n.emailSimulated) {
      setEmailPreview(n)
    }
  }

  function copyEmailContent(body: string) {
    navigator.clipboard?.writeText(body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnchorShell title="Notifications & Communications">
      {/* Header Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-cocoa dark:text-white">
            Anchor Notifications
          </h1>
          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Turnover review reminders, credit committee decisions, and compliance communications.
          </p>
        </div>

        {counts.unread > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-sky text-cocoa hover:bg-sky-hover transition-colors shadow-sm"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs and Categories Bar */}
      <div className="space-y-3 mb-5">
        {/* State Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-surface-border dark:border-surface-dark-border pb-3">
          <div className="flex gap-2">
            {(['unread', 'read', 'archived'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold capitalize border flex items-center gap-1.5 transition-colors ${
                  tab === t
                    ? 'bg-cocoa text-white border-cocoa dark:bg-sky dark:text-cocoa dark:border-sky'
                    : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>{t}</span>
                {counts[t] > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab === t
                        ? 'bg-white/20 text-white dark:bg-cocoa/20 dark:text-cocoa'
                        : 'bg-black/5 dark:bg-white/10 text-text-light-muted dark:text-text-dark-muted'
                    }`}
                  >
                    {counts[t]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs text-text-light-muted dark:text-text-dark-muted">
            <Filter size={12} />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | AnchorNotificationCategory)}
              aria-label="Filter notifications by category"
              className="text-xs font-medium border border-surface-border dark:border-surface-dark-border rounded-[4px] px-2 py-1 bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(categoryMeta).map(([catKey, meta]) => (
                <option key={catKey} value={catKey}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <EmptyState
            icon={Bell}
            title={`No ${tab} notifications`}
            detail={
              categoryFilter !== 'ALL'
                ? `No notifications found matching the category "${categoryMeta[categoryFilter]?.label || categoryFilter}".`
                : tab === 'unread'
                ? 'You are completely caught up! No unread notifications pending.'
                : `You currently have no ${tab} notifications.`
            }
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden divide-y divide-surface-border dark:divide-surface-dark-border">
          {filtered.map((n) => {
            const meta = categoryMeta[n.category] || categoryMeta.SYSTEM
            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start gap-3 transition-colors ${
                  n.state === 'unread'
                    ? 'bg-sky-tint/20 dark:bg-sky/5 hover:bg-sky-tint/30 dark:hover:bg-sky/10'
                    : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.015]'
                }`}
              >
                {/* Status Dot / Indicator */}
                <div className="pt-1 shrink-0">
                  {n.state === 'unread' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-sky block shadow-sm ring-4 ring-sky/20" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-transparent block" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleOpen(n)}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[3px] ${meta.tone}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                      {formatDateTime(n.date)}
                    </span>
                  </div>

                  <h3
                    className={`text-sm ${
                      n.state === 'unread' ? 'font-bold text-cocoa dark:text-white' : 'font-medium text-cocoa/90 dark:text-white/90'
                    }`}
                  >
                    {n.title}
                  </h3>

                  <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                    {n.body}
                  </p>

                  {n.emailSimulated && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-mediterranean dark:text-sky hover:underline">
                      <Mail size={12} />
                      <span>Contains Official NCBA Dispatch Preview</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 pl-2">
                  {n.emailSimulated && (
                    <button
                      onClick={() => setEmailPreview(n)}
                      className="p-1.5 rounded-[4px] text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Preview simulated email"
                    >
                      <Mail size={15} />
                    </button>
                  )}

                  {n.state !== 'archived' ? (
                    <button
                      onClick={() => setNotificationState(n.id, 'archived')}
                      className="p-1.5 rounded-[4px] text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Archive notification"
                    >
                      <Archive size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setNotificationState(n.id, 'read')}
                      className="p-1.5 rounded-[4px] text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Unarchive notification"
                    >
                      <ArchiveRestore size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Email Preview Modal */}
      {emailPreview && (
        <Modal title="Simulated Bank Dispatch Preview" onClose={() => setEmailPreview(null)}>
          <div className="space-y-3">
            <div className="bg-surface-light dark:bg-surface-dark-bg p-3.5 rounded-[6px] border border-surface-border dark:border-surface-dark-border text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted">From:</span>
                <span className="font-semibold text-cocoa dark:text-white">
                  NCBA Supply Chain Credit &lt;credit-ops@ncbagroup.com&gt;
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted">To:</span>
                <span className="font-medium text-cocoa dark:text-white">
                  grace.wanjiru@eabl.co.ke (Trade Credit Desk)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-light-muted dark:text-text-dark-muted">Date:</span>
                <span className="text-text-light-secondary dark:text-text-dark-secondary">
                  {formatDateTime(emailPreview.date)}
                </span>
              </div>
              <div className="pt-1 border-t border-surface-border dark:border-surface-dark-border">
                <span className="text-text-light-muted dark:text-text-dark-muted block text-[11px]">Subject:</span>
                <span className="font-bold text-cocoa dark:text-white text-sm">
                  {emailPreview.emailSubject || emailPreview.title}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-[6px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border">
              <div className="whitespace-pre-line text-xs sm:text-sm text-cocoa dark:text-text-dark-secondary leading-relaxed font-sans">
                {emailPreview.emailBody || emailPreview.body}
              </div>

              <div className="mt-4 pt-3 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-[11px] text-text-light-muted dark:text-text-dark-muted">
                <span>Dispatched by NCBA Automated Facility Engine</span>
                <span className="font-mono">Ref: {emailPreview.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => copyEmailContent(emailPreview.emailBody || emailPreview.body)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border text-xs font-semibold text-text-light-secondary dark:text-text-dark-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {copied ? <Check size={13} className="text-mediterranean" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy Body'}
              </button>
              <button
                onClick={() => setEmailPreview(null)}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-[4px] bg-cocoa text-white dark:bg-sky dark:text-cocoa text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <X size={13} />
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AnchorShell>
  )
}
