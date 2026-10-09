import { useNavigate } from 'react-router-dom'
import {
  Users,
  Wallet,
  TrendingUp,
  Activity,
  ChevronRight,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileBarChart2,
} from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { MetricCard } from '../../components/anchor/MetricCard'
import { SalesChart } from '../../components/anchor/SalesChart'
import { formatKES } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'

export default function AnchorDashboard() {
  const navigate = useNavigate()
  const { user, customers, monthlySales, weeklySales, turnoverReview, loading } = useAnchorPortal()

  if (loading || !user) {
    return (
      <AnchorShell title="Dashboard">
        <LoadingState label="Loading your portal…" />
      </AnchorShell>
    )
  }

  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === 'ACTIVE').length
  const withFacility = customers.filter((c) => c.outstanding > 0).length
  const totalFinancing = customers.reduce((s, c) => s + c.outstanding, 0)
  const totalSales = customers.reduce((s, c) => s + c.annualSales, 0)
  const thisWeek = weeklySales[weeklySales.length - 1]?.sales ?? 0
  const thisMonth = monthlySales[monthlySales.length - 1]?.sales ?? 0

  // Obligation alerts calculation
  const overdueCustomers = customers.filter((c) => c.overdueAgeing !== 'Current')
  const totalOverdueExposure = overdueCustomers.reduce((s, c) => s + c.outstanding, 0)
  const upcomingCustomers = customers.filter(
    (c) => c.upcomingDueDate && c.overdueAgeing === 'Current' && c.outstanding > 0
  )

  return (
    <AnchorShell title="Dashboard">
      <div className="space-y-4">
        {/* Welcome Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted font-medium">
              Anchor Partner Portal • Enterprise Overview
            </p>
            <h1 className="text-xl font-extrabold text-cocoa dark:text-white tracking-tight">
              {user.anchorName} — {user.contactName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-[20px] bg-mediterranean/10 text-mediterranean dark:text-sky font-semibold border border-mediterranean/20">
              NCBA BOOSTA Verified Anchor
            </span>
          </div>
        </div>

        {/* Turnover Review Prompt Banner */}
        {turnoverReview && turnoverReview.status === 'DUE_SOON' && (
          <div className="p-3.5 rounded-[6px] bg-sun/15 border border-sun/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <FileBarChart2 size={18} className="text-cocoa dark:text-sun shrink-0" />
              <div>
                <p className="text-xs font-bold text-cocoa dark:text-white">
                  Annual Turnover Review ({turnoverReview.period}) Due Soon
                </p>
                <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
                  Submission deadline: {new Date(turnoverReview.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}. Upload financial statements to preserve credit limits.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/anchor/turnover-review')}
              className="px-3 py-1.5 rounded-[4px] bg-cocoa text-white hover:bg-cocoa-hover text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
            >
              Start Review <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Upcoming & Overdue Obligation Alerts Card */}
        {overdueCustomers.length > 0 && (
          <div className="p-4 rounded-[6px] bg-coral/10 border border-coral/30 flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-coral shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-coral uppercase tracking-wide">
                    Retailer Obligation Alerts
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-coral text-white font-bold">
                    {overdueCustomers.length} Overdue
                  </span>
                </div>
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                  <span className="font-bold text-cocoa dark:text-white">
                    {overdueCustomers.length} retailer account{overdueCustomers.length === 1 ? '' : 's'}
                  </span>{' '}
                  have past-due balances totaling{' '}
                  <span className="font-bold text-coral">{formatKES(totalOverdueExposure)}</span>{' '}
                  (Ageing up to 90+ DPD). {upcomingCustomers.length} facilities mature in the next 7 days.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/anchor/customers?filter=OVERDUE')}
              className="px-3 py-1.5 rounded-[4px] bg-coral hover:bg-coral-hover text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 self-center"
            >
              Inspect Aging Portfolio <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* KPI Metric Cards */}
        <div>
          <p className="text-xs font-semibold text-text-light-muted dark:text-text-dark-muted uppercase tracking-wide mb-2">
            Network Key Performance Indicators
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              icon={Users}
              label="Retailer Network"
              value={String(totalCustomers)}
              sub={`${activeCustomers} active buyers`}
            />
            <MetricCard
              icon={Wallet}
              label="Funded Facility Book"
              value={formatKES(totalFinancing)}
              sub={`${withFacility} drawn facilities`}
              tone="positive"
            />
            <MetricCard
              icon={TrendingUp}
              label="Annual Sales (YTD)"
              value={formatKES(totalSales)}
              sub="12% YoY growth"
            />
            <MetricCard
              icon={Activity}
              label="Sales this week"
              value={formatKES(thisWeek)}
              sub={`Month to date: ${formatKES(thisMonth)}`}
            />
          </div>
        </div>

        {/* Charts & Top Customers */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-cocoa dark:text-white">Monthly Sales Volume</p>
                <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
                  Financed distributor orders (height: 150px)
                </p>
              </div>
              <button
                onClick={() => navigate('/anchor/sales')}
                className="text-xs font-semibold text-cocoa dark:text-sky hover:underline flex items-center gap-0.5"
              >
                Deep-dive <ChevronRight size={14} />
              </button>
            </div>
            <SalesChart data={monthlySales} style="line" height={150} color="#00A3E0" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-cocoa dark:text-white">Top Financed Buyers</p>
                <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
                  Ranked by annual turnover
                </p>
              </div>
              <button
                onClick={() => navigate('/anchor/customers')}
                className="text-xs font-semibold text-cocoa dark:text-sky hover:underline flex items-center gap-0.5"
              >
                All Retailers <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-1 divide-y divide-surface-border/60 dark:divide-surface-dark-border/60">
              {[...customers]
                .sort((a, b) => b.annualSales - a.annualSales)
                .slice(0, 5)
                .map((c, i) => (
                  <button
                    key={c.customerId}
                    onClick={() => navigate(`/anchor/customers/${c.customerId}`)}
                    className="w-full flex items-center gap-3 py-2 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-[4px] px-1 transition-colors"
                  >
                    <span className="w-4 text-xs font-bold text-text-light-muted dark:text-text-dark-muted">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-cocoa dark:text-white truncate">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted font-mono truncate">
                        ID: {c.nationalId} • Limit {formatKES(c.limit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-cocoa dark:text-white">
                        {formatKES(c.annualSales)}
                      </p>
                      <span
                        className={`text-[10px] font-semibold ${
                          c.overdueAgeing !== 'Current' ? 'text-coral' : 'text-mediterranean'
                        }`}
                      >
                        {c.overdueAgeing}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </AnchorShell>
  )
}
