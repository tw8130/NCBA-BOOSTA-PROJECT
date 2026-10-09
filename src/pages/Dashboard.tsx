import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Banknote, Receipt, LifeBuoy, ChevronRight, Landmark, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { LimitCard } from '../components/domain/LimitCard'
import { AnchorCard } from '../components/domain/AnchorCard'
import { LoanCard } from '../components/domain/LoanCard'
import { CRBRestrictionModal } from '../components/domain/CRBRestrictionModal'
import { ReassessmentModal } from '../components/domain/ReassessmentModal'
import { LoadingState } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useApp } from '../context/AppContext'
import { useOnboarding } from '../context/OnboardingContext'

const actions = [
  { to: '/customer/drawdown', label: 'Draw down facility', icon: Wallet },
  { to: '/customer/repay', label: 'Repay a loan', icon: Banknote },
  { to: '/customer/transactions', label: 'View ledger transactions', icon: Receipt },
  { to: '/customer/support', label: 'Help & support center', icon: LifeBuoy },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { customer, anchors, loans, loading, refresh } = useApp()
  const { state: onboardingState } = useOnboarding()
  const [crbModalAnchorId, setCrbModalAnchorId] = useState<string | null>(null)
  const [showReassessmentModal, setShowReassessmentModal] = useState(false)

  if (loading || !customer) {
    return (
      <AppShell title="My Boosta">
        <LoadingState label="Loading your credit facilities…" />
      </AppShell>
    )
  }

  const totalApproved = anchors.reduce((s, a) => s + a.approvedLimit, 0)
  const totalAvailable = anchors.reduce((s, a) => s + a.availableLimit, 0)
  const totalUsed = totalApproved - totalAvailable
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE')
  const modalAnchor = anchors.find((a) => a.id === crbModalAnchorId)

  return (
    <AppShell title="My Boosta">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-[12px] text-text-light-muted dark:text-text-dark-muted font-medium">Welcome back,</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            {onboardingState.fullName || customer.fullName}
          </h1>
          <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
            {onboardingState.businessName || customer.businessName} ·{' '}
            {onboardingState.businessType === 'PARTNERSHIP'
              ? 'Partnership'
              : onboardingState.businessType === 'LIMITED_COMPANY'
              ? 'Limited Company (CR12)'
              : 'Sole Proprietorship'}
          </p>
        </div>
        <StatusBadge label="KYB Verified" tone="success" icon={<ShieldCheck size={11} />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Hero Band with Utilisation Ring (A5 Requirement) */}
          <LimitCard
            totalApproved={totalApproved}
            totalUsed={totalUsed}
            totalAvailable={totalAvailable}
            anchors={anchors}
          />

          {/* Active Loans */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary">
                My Active Loans
              </p>
              <button
                onClick={() => navigate('/customer/loans')}
                className="text-[11px] font-semibold text-cocoa dark:text-sky flex items-center gap-0.5 underline decoration-sky"
              >
                View all ({activeLoans.length}) <ChevronRight size={13} />
              </button>
            </div>
            {activeLoans.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No active loans"
                detail="Loans you draw down will appear here, each with an independent tenor and due date."
              />
            ) : (
              <div className="space-y-2.5">
                {activeLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    anchor={anchors.find((a) => a.id === loan.anchorId)}
                    onClick={() => navigate(`/customer/loans/${loan.id}`)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Anchors Facilities */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary">
                Approved Anchor Partners
              </p>
              <button
                onClick={() => navigate('/customer/anchors')}
                className="text-[11px] font-semibold text-cocoa dark:text-sky flex items-center gap-0.5 underline decoration-sky"
              >
                View all ({anchors.length}) <ChevronRight size={13} />
              </button>
            </div>
            <div className="space-y-3">
              {anchors.map((a) => (
                <div key={a.id} className="p-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-white/[0.02]">
                  <AnchorCard
                    anchor={a}
                    activeLoanCount={loans.filter((l) => l.anchorId === a.id && l.status === 'ACTIVE').length}
                  />
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => navigate(`/customer/anchors/${a.id}`)}
                      className="flex-1 py-1.5 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border text-cocoa dark:text-white text-[12px] font-medium flex items-center justify-center gap-1 hover:border-sky/40"
                    >
                      <Landmark size={13} /> Details
                    </button>
                    <button
                      onClick={() => (a.drawdownAllowed ? navigate(`/customer/drawdown?anchor=${a.id}`) : setCrbModalAnchorId(a.id))}
                      className={`flex-1 py-1.5 rounded-[4px] text-[12px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                        a.drawdownAllowed
                          ? 'bg-sky text-cocoa hover:bg-sky-hover active:bg-sky-dark'
                          : 'bg-black/5 dark:bg-white/5 text-text-light-muted dark:text-text-dark-muted border border-surface-border dark:border-white/10'
                      }`}
                    >
                      <Wallet size={13} /> Draw down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-4">
          {/* Credit Score Card (Spec Screen 4) */}
          <Card className="p-4 border-sky/30 bg-sky-tint/20 dark:bg-sky/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-sky uppercase tracking-wide">NCBA Data Scorecard</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[20px] bg-mediterranean/10 text-mediterranean border border-mediterranean/30">
                Excellent
              </span>
            </div>
            <div className="flex items-center gap-3 my-2">
              <div className="w-12 h-12 rounded-full border-4 border-sky flex items-center justify-center font-extrabold text-[15px] text-cocoa dark:text-white">
                751
              </div>
              <div>
                <p className="text-[13px] font-bold text-cocoa dark:text-text-dark-primary">751 / 900</p>
                <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted">High repayment velocity</p>
              </div>
            </div>
            <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-1 mb-3">
              Your scorecard qualifies you for preferential facility fees across approved anchors. Upload your M-Pesa turnover statement to request a limit increase.
            </p>
            <button
              onClick={() => setShowReassessmentModal(true)}
              className="w-full py-2 rounded-[4px] bg-cocoa text-white dark:bg-sky dark:text-cocoa text-[11px] font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <TrendingUp size={13} /> Improve My Score
            </button>
          </Card>

          {/* Quick Actions */}
          <Card className="p-3">
            <p className="text-[12px] font-semibold text-cocoa dark:text-text-dark-primary mb-2 px-2">
              Quick Operations
            </p>
            <div className="space-y-1">
              {actions.map(({ to, label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-[4px] bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky flex items-center justify-center shrink-0 border border-sky/20">
                    <Icon size={15} strokeWidth={1.75} />
                  </div>
                  <span className="flex-1 text-[12px] font-medium text-cocoa dark:text-text-dark-primary">
                    {label}
                  </span>
                  <ChevronRight size={14} className="text-text-light-muted dark:text-text-dark-muted" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {modalAnchor && (
        <CRBRestrictionModal
          anchorName={modalAnchor.name}
          limit={modalAnchor.approvedLimit}
          onClose={() => setCrbModalAnchorId(null)}
        />
      )}

      {showReassessmentModal && (
        <ReassessmentModal
          onClose={() => setShowReassessmentModal(false)}
          onSuccess={() => {
            refresh()
          }}
        />
      )}
    </AppShell>
  )
}
