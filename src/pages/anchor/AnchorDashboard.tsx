import { useNavigate } from 'react-router-dom'
import { Users, Wallet, TrendingUp, Activity, ChevronRight } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
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

  return (
    <AnchorShell title="Dashboard">
      <div className="mb-5">
        <p className="text-sm text-text-light-muted dark:text-text-dark-muted">Welcome back,</p>
        <h1 className="text-xl font-extrabold text-cocoa dark:text-white tracking-tight">{user.anchorName} — {user.contactName}</h1>
      </div>

      {turnoverReview && turnoverReview.status === 'DUE_SOON' && (
        <Card className="p-4 mb-4 bg-sun/15 border border-sun/30 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-cocoa dark:text-white">Annual turnover review due soon</p>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted mt-0.5">Due {new Date(turnoverReview.dueDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long' })}</p>
          </div>
          <button onClick={() => navigate('/anchor/turnover-review')} className="text-xs font-bold text-cocoa dark:text-white flex items-center gap-1 shrink-0 hover:underline">
            Review <ChevronRight size={14} />
          </button>
        </Card>
      )}

      <p className="text-xs font-semibold text-text-light-muted dark:text-text-dark-muted uppercase tracking-wide mb-2">Business overview</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard icon={Users} label="Total customers" value={String(totalCustomers)} sub={`${activeCustomers} active`} />
        <MetricCard icon={Wallet} label="Total financing" value={formatKES(totalFinancing)} sub={`${withFacility} with a facility`} tone="positive" />
        <MetricCard icon={TrendingUp} label="Total sales (annual)" value={formatKES(totalSales)} />
        <MetricCard icon={Activity} label="Sales this week" value={formatKES(thisWeek)} sub={`Month to date: ${formatKES(thisMonth)}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-cocoa dark:text-white">Monthly sales trend</p>
            <button onClick={() => navigate('/anchor/sales')} className="text-xs font-semibold text-cocoa dark:text-sky hover:underline flex items-center gap-0.5">
              Details <ChevronRight size={14} />
            </button>
          </div>
          <SalesChart data={monthlySales} style="line" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-cocoa dark:text-white">Top customers</p>
            <button onClick={() => navigate('/anchor/customers')} className="text-xs font-semibold text-cocoa dark:text-sky hover:underline flex items-center gap-0.5">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {[...customers].sort((a, b) => b.annualSales - a.annualSales).slice(0, 5).map((c, i) => (
              <button
                key={c.customerId}
                onClick={() => navigate(`/anchor/customers/${c.customerId}`)}
                className="w-full flex items-center gap-3 py-2 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-[4px] px-1 transition-colors"
              >
                <span className="w-5 text-xs font-bold text-text-light-muted dark:text-text-dark-muted">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-cocoa dark:text-white truncate">{c.name}</span>
                <span className="text-sm font-semibold text-text-light-secondary dark:text-text-dark-secondary">{formatKES(c.annualSales)}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AnchorShell>
  )
}
