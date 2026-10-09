import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { LoadingState } from '../../components/ui/LoadingState'
import { SalesChart } from '../../components/anchor/SalesChart'
import { StatusPie } from '../../components/anchor/StatusPie'
import { formatKES } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'

export default function AnchorReports() {
  const { customers, monthlySales, weeklySales, annualSales, loading } = useAnchorPortal()

  if (loading) {
    return (
      <AnchorShell title="Reports">
        <LoadingState />
      </AnchorShell>
    )
  }

  const financedCount = customers.filter((c) => c.outstanding > 0).length
  const totalFinancing = customers.reduce((s, c) => s + c.outstanding, 0)
  const avgFinancing = financedCount ? Math.round(totalFinancing / financedCount) : 0

  const financingStatusPie = [
    { name: 'Active facility', value: customers.filter((c) => c.status === 'ACTIVE').length, color: '#00A3E0' },
    { name: 'Dormant', value: customers.filter((c) => c.status === 'DORMANT').length, color: '#003865' },
    { name: 'Restricted', value: customers.filter((c) => c.status === 'RESTRICTED').length, color: '#E05A47' },
  ]

  const contributionPie = [...customers]
    .sort((a, b) => b.annualSales - a.annualSales)
    .slice(0, 5)
    .map((c, i) => ({ name: c.name, value: c.annualSales, color: ['#00A3E0', '#003865', '#3D2619', '#F5A623', '#E05A47'][i] }))

  const currentYear = annualSales[annualSales.length - 1]?.sales ?? 0
  const previousYear = annualSales[annualSales.length - 2]?.sales ?? 0
  const growthPct = previousYear ? Math.round(((currentYear - previousYear) / previousYear) * 100) : 0

  return (
    <AnchorShell title="Reports">
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-1">Sales report — monthly</p>
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted mb-3">Trend across the current year.</p>
          <SalesChart data={monthlySales} style="line" />
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-1">Sales report — weekly</p>
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted mb-3">Most recent 8 weeks.</p>
          <SalesChart data={weeklySales} style="bar" />
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Customer contribution</p>
          <StatusPie data={contributionPie} />
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Financing status</p>
          <StatusPie data={financingStatusPie} />
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Customer financing report</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Financed customers" value={String(financedCount)} />
            <Stat label="Total financing" value={formatKES(totalFinancing)} />
            <Stat label="Average financing" value={formatKES(avgFinancing)} />
            <Stat label="Utilisation" value={`${Math.round(customers.reduce((s, c) => s + c.utilisationPct, 0) / customers.length)}%`} />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Annual turnover comparison</p>
          <SalesChart data={annualSales} style="bar" height={150} />
          <p className={`text-xs font-semibold mt-2 ${growthPct >= 0 ? 'text-mediterranean' : 'text-coral'}`}>
            {growthPct >= 0 ? '+' : ''}{growthPct}% vs previous year
          </p>
        </Card>
      </div>
    </AnchorShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">{label}</p>
      <p className="font-bold text-cocoa dark:text-white">{value}</p>
    </div>
  )
}
