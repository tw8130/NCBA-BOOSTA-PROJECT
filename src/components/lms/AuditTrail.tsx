import { CheckCircle2, XCircle, PlusCircle, Send, ShieldAlert, Clock } from 'lucide-react'
import { formatDateTime } from '../../lib/format'
import type { LmsAuditEntry } from '../../types'

interface AuditTrailProps {
  entries: LmsAuditEntry[]
  title?: string
}

const actionIcons = {
  CREATED: PlusCircle,
  SUBMITTED: Send,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
}

const actionColors = {
  CREATED: 'text-text-light-muted dark:text-text-dark-muted bg-surface-light dark:bg-white/5 border-surface-border dark:border-white/10',
  SUBMITTED: 'text-sky bg-sky-tint/30 dark:bg-sky/15 border-sky/30',
  APPROVED: 'text-mediterranean bg-mediterranean/15 dark:bg-mediterranean/25 border-mediterranean/40',
  REJECTED: 'text-coral bg-coral/15 dark:bg-coral/25 border-coral/40',
}

export function AuditTrail({ entries, title = 'Maker-Checker Immutable Audit Trail' }: AuditTrailProps) {
  if (entries.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-text-light-muted dark:text-text-dark-muted">
        No audit logs recorded for this item.
      </div>
    )
  }

  // Sort chronological descending (most recent first)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-cocoa dark:text-sky" />
          <h3 className="text-xs font-bold text-cocoa dark:text-white uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted font-mono">
          {sorted.length} Entries Logged
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-border dark:before:bg-surface-dark-border">
        {sorted.map((entry) => {
          const Icon = actionIcons[entry.action] || Clock
          const colorClass = actionColors[entry.action] || 'text-text-light-muted'

          return (
            <div key={entry.id} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 shadow-xs ${colorClass}`}
              >
                <Icon size={11} strokeWidth={2.2} />
              </div>

              {/* Event Content */}
              <div className="bg-surface-light dark:bg-white/[0.02] p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border hover:border-sky/40 transition-colors text-xs">
                <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-cocoa dark:text-white">
                      {entry.action}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-[2px] ${
                        entry.actorRole === 'BANK_CHECKER'
                          ? 'bg-mediterranean/15 text-mediterranean dark:text-sky'
                          : 'bg-sun/20 text-cocoa dark:text-sun'
                      }`}
                    >
                      {entry.actorRole === 'BANK_CHECKER' ? 'Checker' : 'Maker'}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted font-mono">
                    {formatDateTime(entry.timestamp)}
                  </span>
                </div>

                <p className="text-text-light-secondary dark:text-text-dark-secondary text-[11px] leading-relaxed">
                  {entry.details}
                </p>

                <div className="mt-1.5 pt-1 border-t border-surface-border dark:border-white/5 flex items-center justify-between text-[10px] text-text-light-muted dark:text-text-dark-muted">
                  <span>Actor: <strong className="text-cocoa dark:text-white">{entry.actorName}</strong> ({entry.actorId})</span>
                  <span className="font-mono">Ref: {entry.requestId}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
