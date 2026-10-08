import {
  CheckCircle2, Banknote, AlertTriangle, Clock, FileCheck, Settings, XCircle, ShieldAlert, Landmark, UserCheck,
} from 'lucide-react'
import { formatDateTime } from '../../lib/format'
import type { AppNotification, NotificationType } from '../../types'

const typeMeta: Record<NotificationType, { icon: typeof CheckCircle2; color: string }> = {
  LOAN_APPROVED: { icon: CheckCircle2, color: 'text-mediterranean bg-mediterranean/15' },
  LOAN_DISBURSED: { icon: Banknote, color: 'text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15' },
  REPAYMENT_SUCCESS: { icon: CheckCircle2, color: 'text-mediterranean bg-mediterranean/15' },
  PARTIAL_REPAYMENT: { icon: Banknote, color: 'text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15' },
  DUE_SOON: { icon: Clock, color: 'text-cocoa dark:text-white bg-sun/20' },
  LOAN_OVERDUE: { icon: AlertTriangle, color: 'text-coral bg-coral/15' },
  PAYMENT_FAILED: { icon: XCircle, color: 'text-coral bg-coral/15' },
  CRB_RESTRICTION: { icon: ShieldAlert, color: 'text-cocoa dark:text-white bg-sun/20' },
  LIMIT_UPDATE: { icon: FileCheck, color: 'text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15' },
  ANCHOR_ADDED: { icon: Landmark, color: 'text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15' },
  ACCOUNT_VERIFICATION: { icon: UserCheck, color: 'text-mediterranean bg-mediterranean/15' },
  KYC_VERIFICATION: { icon: UserCheck, color: 'text-mediterranean bg-mediterranean/15' },
  DOCUMENT_VERIFICATION: { icon: FileCheck, color: 'text-mediterranean bg-mediterranean/15' },
  APPLICATION_DECLINED: { icon: AlertTriangle, color: 'text-cocoa dark:text-white bg-sun/20' },
  SYSTEM_MAINTENANCE: { icon: Settings, color: 'text-text-light-muted dark:text-text-dark-muted bg-black/5 dark:bg-white/10' },
}

export function NotificationItem({ notification, onClick }: { notification: AppNotification; onClick?: () => void }) {
  const meta = typeMeta[notification.type]
  const Icon = meta.icon
  return (
    <button onClick={onClick} className="w-full flex gap-3 py-3 text-left border-b border-surface-border dark:border-surface-dark-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-cocoa dark:text-white">{notification.title}</p>
          {!notification.read && <span className="w-2 h-2 rounded-full bg-sky shrink-0" />}
        </div>
        <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-0.5 leading-relaxed">{notification.body}</p>
        <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-1">{formatDateTime(notification.date)}</p>
      </div>
    </button>
  )
}
