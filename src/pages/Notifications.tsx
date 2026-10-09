import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  Smartphone,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  ShieldAlert,
  Send,
} from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { NotificationItem } from '../components/domain/NotificationItem'
import { formatDateTime, formatDate, formatKES } from '../lib/format'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import type { AppNotification } from '../types'

type NotificationCategory = 'ALL' | 'LOANS' | 'REPAYMENTS' | 'SYSTEM'

const CATEGORIES: { id: NotificationCategory; label: string }[] = [
  { id: 'ALL', label: 'All Alerts' },
  { id: 'LOANS', label: 'Loan Due & Disbursements' },
  { id: 'REPAYMENTS', label: 'Repayment Receipts' },
  { id: 'SYSTEM', label: 'System & Limits' },
]

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, loans, anchors, customer, loading, markNotificationRead, markAllNotificationsRead, refresh } =
    useApp()

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('ALL')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [simulatingLoanId, setSimulatingLoanId] = useState<string | null>(null)
  const [simulatedSmsToast, setSimulatedSmsToast] = useState<string | null>(null)

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
  const unreadCount = notifications.filter((n) => !n.read).length

  // Categorize notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (unreadOnly && n.read) return false

      if (activeCategory === 'ALL') return true
      if (activeCategory === 'LOANS') {
        return (
          n.type === 'LOAN_APPROVED' ||
          n.type === 'LOAN_DISBURSED' ||
          n.type === 'DUE_SOON' ||
          n.type === 'LOAN_OVERDUE'
        )
      }
      if (activeCategory === 'REPAYMENTS') {
        return (
          n.type === 'REPAYMENT_SUCCESS' ||
          n.type === 'PARTIAL_REPAYMENT' ||
          n.type === 'PAYMENT_FAILED'
        )
      }
      if (activeCategory === 'SYSTEM') {
        return (
          n.type === 'CRB_RESTRICTION' ||
          n.type === 'LIMIT_UPDATE' ||
          n.type === 'ANCHOR_ADDED' ||
          n.type === 'ACCOUNT_VERIFICATION' ||
          n.type === 'KYC_VERIFICATION' ||
          n.type === 'DOCUMENT_VERIFICATION' ||
          n.type === 'APPLICATION_DECLINED' ||
          n.type === 'SYSTEM_MAINTENANCE'
        )
      }
      return true
    })
  }, [notifications, activeCategory, unreadOnly])

  // Demo: trigger simulated 3-day reminder for an active loan
  async function triggerSimulatedReminder(loanId: string) {
    setSimulatingLoanId(loanId)
    try {
      const created = await api.simulateThreeDayReminder(loanId)
      await refresh()
      setSimulatedSmsToast(created.body)
      setTimeout(() => setSimulatedSmsToast(null), 8000)
    } finally {
      setSimulatingLoanId(null)
    }
  }

  return (
    <AppShell title="Notification Centre">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-[6px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky/15 text-sky flex items-center justify-center font-bold">
              <Bell size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-cocoa dark:text-white">
                Activity Feed
              </h2>
              <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold border transition-colors ${
                unreadOnly
                  ? 'bg-sky text-cocoa border-sky'
                  : 'bg-surface-light dark:bg-white/[0.03] text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border'
              }`}
            >
              Unread only
            </button>

            {unreadCount > 0 && (
              <Button size="sm" variant="secondary" onClick={() => markAllNotificationsRead()}>
                <CheckCheck size={14} className="mr-1 inline" /> Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* 3-Day Maturity Reminder Simulation Box */}
        {activeLoans.length > 0 && (
          <div className="p-4 rounded-[6px] bg-sun/15 border border-sun/40 text-cocoa dark:text-white">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-cocoa dark:text-sun shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Per-Loan 3-Day Maturity Alert Simulator
                </span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sun/30 text-cocoa">
                A4.11 Regulatory Requirement
              </span>
            </div>
            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary leading-relaxed mb-3">
              BOOSTA dispatches automated in-app & SMS reminders 3 days before any loan due date. Click below to test the instant multi-channel alert pipeline:
            </p>

            <div className="flex flex-wrap gap-2">
              {activeLoans.map((l) => {
                const anc = anchors.find((a) => a.id === l.anchorId)
                return (
                  <button
                    key={l.id}
                    disabled={simulatingLoanId === l.id}
                    onClick={() => triggerSimulatedReminder(l.id)}
                    className="px-3 py-1.5 rounded-[4px] bg-cocoa text-white hover:bg-cocoa-hover text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send size={12} className="text-sky" />
                    <span>
                      Trigger 3-Day Alert for {anc?.name} ({l.reference})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Simulated Mobile SMS Banner */}
        {simulatedSmsToast && (
          <div className="p-3.5 rounded-[6px] bg-cocoa text-white border-2 border-sky shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-sky mb-1">
              <Smartphone size={14} />
              <span>SIMULATED SMS DISPATCHED TO {customer?.phone || '+254 712 345 678'}</span>
            </div>
            <div className="bg-black/30 p-2.5 rounded font-mono text-xs text-white/90 leading-relaxed">
              {simulatedSmsToast}
            </div>
          </div>
        )}

        {/* Categories Tab Navigation */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-[20px] text-xs font-semibold whitespace-nowrap border transition-all ${
                activeCategory === c.id
                  ? 'bg-sky text-cocoa border-sky shadow-sm'
                  : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-sky/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {loading ? (
          <LoadingState />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alerts in this category"
            detail="Notifications related to your facility repayments, drawdowns, and limit updates will show here."
          />
        ) : (
          <Card className="p-3 sm:p-4 divide-y divide-surface-border dark:divide-surface-dark-border">
            {filteredNotifications.map((n) => {
              const isDueAlert = n.type === 'DUE_SOON' || n.type === 'LOAN_OVERDUE'
              return (
                <div key={n.id} className="relative group">
                  <NotificationItem
                    notification={n}
                    onClick={() => markNotificationRead(n.id)}
                  />

                  {/* Quick Shortcut for Due Soon / Overdue */}
                  {isDueAlert && n.loanId && (
                    <div className="pl-12 pb-3 pt-1 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markNotificationRead(n.id)
                          navigate(`/customer/repay?loanId=${n.loanId}`)
                        }}
                        className="px-2.5 py-1 rounded-[4px] bg-sky hover:bg-sky-hover text-cocoa text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>Repay This Loan Now</span>
                        <ArrowRight size={12} />
                      </button>
                      <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted">
                        Fast-track repayment
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </Card>
        )}
      </div>
    </AppShell>
  )
}
