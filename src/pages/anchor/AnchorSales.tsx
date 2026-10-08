import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { LoadingState } from '../../components/ui/LoadingState'
import { SalesChart } from '../../components/anchor/SalesChart'
import { formatKES } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'

type Period = 'weekly' | 'monthly' | 'annual'

export default function AnchorSales() {
  const { customers, weeklySales, monthlySales, annualSales, loading } = useAnchorPortal()
  const [period, setPeriod] = useState<Period>('monthly')
  const [customerFilter, setCustomerFilter] = useState<'ALL' | string>('ALL')

  if (loading) {
    return (
      <AnchorShell title="Sales">
        <LoadingState />
      </AnchorShell>
    )
  }

  const dataByPeriod = { weekly: weeklySales, monthly: monthlySales, annual: annualSales }
  const data = dataByPeriod[period]
  const total = data.reduce((s, d) => s + d.sales, 0)
  const avg = data.length ? Math.round(total / data.length) : 0

  const filteredCustomers = customerFilter === 'ALL' ? customers : customers.filter((c) => c.customerId === customerFilter)

  return (
    <AnchorShell title="Sales">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'annual'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold capitalize border transition-colors ${
                period === p
                  ? 'bg-sky text-cocoa border-sky'
                  : 'bg-surface-light dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="text-xs font-medium border border-surface-border dark:border-surface-dark-border rounded-[4px] px-2.5 py-1.5 bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky"
        >
          <option value="ALL">All customers</option>
          {customers.map((c) => (
            <option key={c.customerId} value={c.customerId}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <Card className="p-4">
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Total sales ({period})</p>
          <p className="text-2xl font-bold text-cocoa dark:text-white">{formatKES(total)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Average per period</p>
          <p className="text-2xl font-bold text-cocoa dark:text-white">{formatKES(avg)}</p>
        </Card>
      </div>

      <Card className="p-4 mb-4">
        <p className="text-sm font-semibold text-cocoa dark:text-white mb-3 capitalize">{period} sales</p>
        <SalesChart data={data} style={period === 'weekly' ? 'bar' : 'line'} />
      </Card>

      <Card className="p-4">
        <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Sales per customer</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border">
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Monthly sales</th>
                <th className="pb-2 font-medium">Loan utilisation</th>
                <th className="pb-2 font-medium">Outstanding facility</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.customerId} className="border-b border-surface-border dark:border-surface-dark-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 font-medium text-cocoa dark:text-white text-xs">{c.name}</td>
                  <td className="py-2.5 text-text-light-secondary dark:text-text-dark-secondary text-xs">{formatKES(c.monthlySales)}</td>
                  <td className="py-2.5 text-text-light-secondary dark:text-text-dark-secondary text-xs">{c.utilisationPct}%</td>
                  <td className="py-2.5 text-text-light-secondary dark:text-text-dark-secondary text-xs">{formatKES(c.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AnchorShell>
  )
}
