import { useState } from 'react'
import { CheckSquare, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react'
import { LmsShell } from '../../components/layout/LmsShell'
import { Card } from '../../components/ui/Card'
import { QueueTable } from '../../components/lms/QueueTable'
import { LoadingState } from '../../components/ui/LoadingState'
import { useLms } from '../../context/LmsContext'
import type { LimitAmendmentStatus } from '../../types'

type QueueTab = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

export default function LmsQueue() {
  const { limitAmendments, loading, currentUser, switchLmsRole } = useLms()
  const [tab, setTab] = useState<QueueTab>('PENDING')

  if (loading) {
    return (
      <LmsShell title="Checker Approvals Queue">
        <LoadingState />
      </LmsShell>
    )
  }

  const isChecker = currentUser.role === 'BANK_CHECKER'

  const pendingList = limitAmendments.filter((a) => a.status === 'PENDING_CHECKER')
  const approvedList = limitAmendments.filter((a) => a.status === 'APPROVED')
  const rejectedList = limitAmendments.filter((a) => a.status === 'REJECTED')

  const tabData =
    tab === 'PENDING'
      ? pendingList
      : tab === 'APPROVED'
      ? approvedList
      : tab === 'REJECTED'
      ? rejectedList
      : limitAmendments

  return (
    <LmsShell
      title="Credit Committee Checker Approvals Queue"
      subtitle="Delegated Lending Authority (DLA) • Maker≠Checker Separation of Duties (CBK/PG/04)"
    >
      {/* CBK Policy & Active Role Banner */}
      <div className="mb-4 p-3.5 rounded-[6px] bg-cocoa text-white shadow-sm flex items-center justify-between flex-wrap gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert size={18} className="text-sky shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white text-sm">
              Maker ≠ Checker Separation Policy (Enforced)
            </p>
            <p className="text-white/80 text-[11px] mt-0.5 leading-relaxed">
              Logged in as <strong className="text-sky font-bold">{currentUser.name}</strong> ({isChecker ? 'Checker — Approver' : 'Maker — Initiator'}).
              {isChecker
                ? ' You hold Delegated Lending Authority to approve or reject items not created by you.'
                : ' You are currently in Maker mode. Action buttons on items you created are locked per CBK guidelines.'}
            </p>
          </div>
        </div>

        {/* Quick Role Switcher Button */}
        <button
          type="button"
          onClick={() =>
            switchLmsRole(isChecker ? 'BANK_MAKER' : 'BANK_CHECKER')
          }
          className="px-3 py-1.5 rounded-[4px] bg-sky text-cocoa font-bold text-xs hover:bg-sky-hover transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          {isChecker ? (
            <>
              <UserCheck size={13} /> Switch to Maker Role
            </>
          ) : (
            <>
              <ShieldCheck size={13} /> Switch to Checker Role
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-surface-border dark:border-surface-dark-border pb-3">
        {[
          { id: 'PENDING', label: 'Pending Approvals', count: pendingList.length },
          { id: 'APPROVED', label: 'Approved History', count: approvedList.length },
          { id: 'REJECTED', label: 'Rejected', count: rejectedList.length },
          { id: 'ALL', label: 'All Requests', count: limitAmendments.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as QueueTab)}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              tab === t.id
                ? 'bg-cocoa text-white border-cocoa dark:bg-sky dark:text-cocoa dark:border-sky'
                : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:bg-black/5'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                tab === t.id
                  ? 'bg-white/20 text-white dark:bg-cocoa/20 dark:text-cocoa'
                  : 'bg-black/5 dark:bg-white/10 text-text-light-muted'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        <QueueTable requests={tabData} />
      </Card>
    </LmsShell>
  )
}
