import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Landmark,
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
  CheckSquare,
  FileEdit,
  ArrowRight,
} from 'lucide-react'
import { LmsShell } from '../../components/layout/LmsShell'
import { Card } from '../../components/ui/Card'
import { ParBadge } from '../../components/lms/ParBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatKES } from '../../lib/format'
import { useLms } from '../../context/LmsContext'

const parGradeColors = {
  NORMAL: '#003865', // Mediterranean
  WATCH: '#F5A623', // Sun
  SUBSTANDARD: '#E05A47', // Coral
  DOUBTFUL: '#E05A47', // Coral
  LOSS: '#3D2619', // Cocoa
}

export default function LmsDashboard() {
  const { portfolioSummary, pendingQueueCount, loading, currentUser } = useLms()
  const navigate = useNavigate()

  if (loading || !portfolioSummary) {
    return (
      <LmsShell title="Portfolio Dashboard">
        <LoadingState />
      </LmsShell>
    )
  }

  const chartData = portfolioSummary.parBreakdown.map((item) => ({
    name: item.grade,
    balance: item.balanceKes / 1_000_000, // Millions
    percentage: item.percentage,
    color: parGradeColors[item.grade] || '#00A3E0',
  }))

  return (
    <LmsShell
      title="Portfolio Health & Risk Operations"
      subtitle="NCBA BOOSTA Core LMS • CBK Asset Classification & Oversight"
    >
      {/* Pending Queue Advisory Banner if items exist */}
      {pendingQueueCount > 0 && (
        <div className="mb-4 p-3.5 rounded-[6px] bg-sun/15 border border-sun/40 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-cocoa shrink-0" />
            <p className="text-cocoa font-medium">
              There are <strong className="font-bold">{pendingQueueCount} pending limit amendment request(s)</strong> awaiting Credit Risk Checker review.
            </p>
          </div>
          <button
            onClick={() => navigate('/lms/limits/queue')}
            className="inline-flex items-center gap-1 font-bold text-cocoa hover:underline"
          >
            Open Checker Queue <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Card className="p-3.5">
          <div className="flex items-center justify-between text-text-light-muted dark:text-text-dark-muted mb-1">
            <span className="text-[11px] font-medium">Gross Portfolio</span>
            <Landmark size={14} className="text-mediterranean" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-cocoa dark:text-white">
            {formatKES(portfolioSummary.grossPortfolioKes)}
          </p>
          <span className="text-[10px] text-mediterranean font-semibold">Performing supply-chain</span>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between text-text-light-muted dark:text-text-dark-muted mb-1">
            <span className="text-[11px] font-medium">Collections YTD</span>
            <TrendingUp size={14} className="text-mediterranean" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-cocoa dark:text-white">
            {formatKES(portfolioSummary.collectionsYtdKes)}
          </p>
          <span className="text-[10px] text-text-light-muted">Settled via T24 / Daraja</span>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between text-text-light-muted dark:text-text-dark-muted mb-1">
            <span className="text-[11px] font-medium">NPL Ratio</span>
            <AlertTriangle size={14} className="text-coral" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-coral">
            {portfolioSummary.nplRatioPct}%
          </p>
          <span className="text-[10px] text-text-light-muted">CBK Industry Avg: 15.6%</span>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between text-text-light-muted dark:text-text-dark-muted mb-1">
            <span className="text-[11px] font-medium">Active Anchors</span>
            <Building2 size={14} className="text-sky" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-cocoa dark:text-white">
            {portfolioSummary.activeAnchorsCount}
          </p>
          <span className="text-[10px] text-text-light-muted">EABL, BAT, Unilever, Brookside</span>
        </Card>

        <Card className="p-3.5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-text-light-muted dark:text-text-dark-muted mb-1">
            <span className="text-[11px] font-medium">Financed Retailers</span>
            <Users size={14} className="text-cocoa dark:text-sky" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-cocoa dark:text-white">
            {portfolioSummary.totalRetailersCount}
          </p>
          <span className="text-[10px] text-text-light-muted">Enrolled & vetted MSMEs</span>
        </Card>
      </div>

      {/* Main Grid: PAR by CBK Grade & Chart (Strictly 140–160px) */}
      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        {/* PAR Table (2 Columns) */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-cocoa dark:text-white">
                  Portfolio at Risk (PAR) by CBK Grade
                </h2>
                <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
                  Classified per Central Bank of Kenya Prudential Guideline CBK/PG/04
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[3px] bg-black/5 dark:bg-white/10 text-text-light-muted">
                30% p.a. default penalty applies to past due
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border">
                    <th className="pb-2 font-semibold">CBK Classification</th>
                    <th className="pb-2 font-semibold">DPD Range</th>
                    <th className="pb-2 font-semibold text-right">Accounts</th>
                    <th className="pb-2 font-semibold text-right">Exposure (KES)</th>
                    <th className="pb-2 font-semibold text-right">% Portfolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {portfolioSummary.parBreakdown.map((row) => (
                    <tr
                      key={row.grade}
                      className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                    >
                      <td className="py-2.5">
                        <ParBadge grade={row.grade} />
                      </td>
                      <td className="py-2.5 text-text-light-secondary dark:text-text-dark-secondary font-mono text-[11px]">
                        {row.dpdRange}
                      </td>
                      <td className="py-2.5 text-right font-medium text-cocoa dark:text-white">
                        {row.accountCount}
                      </td>
                      <td className="py-2.5 text-right font-bold text-cocoa dark:text-white font-mono">
                        {formatKES(row.balanceKes)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-text-light-secondary dark:text-text-dark-secondary">
                        {row.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* PAR Distribution Chart (Strictly 150px height) */}
        <div>
          <Card className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-sm font-bold text-cocoa dark:text-white">
                Exposure Distribution (KES M)
              </h2>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mb-2">
                Balance outstanding across grades
              </p>
            </div>

            {/* Strict 150px height Recharts Container */}
            <div style={{ height: 150, width: '100%' }}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={9}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [`KES ${Number(val).toFixed(1)}M`, 'Exposure']}
                    contentStyle={{
                      backgroundColor: '#3D2619',
                      borderColor: '#00A3E0',
                      borderRadius: '4px',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="balance" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-[10px] text-text-light-muted">
              <span>Low-risk exposure</span>
              <span className="font-bold text-mediterranean">88% in Normal grade</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Action Operations */}
      <div className="grid sm:grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/lms/limits/queue')}
          className="p-3.5 rounded-[6px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border hover:border-sky transition-colors text-left flex items-start gap-3 group"
        >
          <div className="w-8 h-8 rounded-[4px] bg-mediterranean/15 text-mediterranean flex items-center justify-center shrink-0">
            <CheckSquare size={16} />
          </div>
          <div>
            <p className="font-bold text-xs text-cocoa dark:text-white group-hover:text-sky transition-colors">
              Checker Approvals Queue
            </p>
            <p className="text-[11px] text-text-light-muted mt-0.5">
              Review and act on {pendingQueueCount} pending credit amendment requests.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/lms/limits/new')}
          className="p-3.5 rounded-[6px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border hover:border-sky transition-colors text-left flex items-start gap-3 group"
        >
          <div className="w-8 h-8 rounded-[4px] bg-sun/20 text-cocoa flex items-center justify-center shrink-0">
            <FileEdit size={16} />
          </div>
          <div>
            <p className="font-bold text-xs text-cocoa dark:text-white group-hover:text-sky transition-colors">
              Maker: Amend Customer Limit
            </p>
            <p className="text-[11px] text-text-light-muted mt-0.5">
              Initiate limit increase or reduction with justification memo.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/lms/partners/new')}
          className="p-3.5 rounded-[6px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border hover:border-sky transition-colors text-left flex items-start gap-3 group"
        >
          <div className="w-8 h-8 rounded-[4px] bg-sky-tint text-cocoa flex items-center justify-center shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <p className="font-bold text-xs text-cocoa dark:text-white group-hover:text-sky transition-colors">
              Maker: Onboard Corporate Anchor
            </p>
            <p className="text-[11px] text-text-light-muted mt-0.5">
              Setup 65/35 partner facility parameters and pricing margins.
            </p>
          </div>
        </button>
      </div>
    </LmsShell>
  )
}
