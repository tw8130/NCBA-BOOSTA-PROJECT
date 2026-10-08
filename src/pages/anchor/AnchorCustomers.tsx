import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatKES } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'
import type { AnchorCustomer } from '../../types'

const statusTone: Record<AnchorCustomer['status'], 'success' | 'neutral' | 'danger'> = {
  ACTIVE: 'success',
  DORMANT: 'neutral',
  RESTRICTED: 'danger',
}

export default function AnchorCustomers() {
  const navigate = useNavigate()
  const { customers, loading } = useAnchorPortal()

  return (
    <AnchorShell title="Customers">
      <p className="text-sm text-text-light-muted dark:text-text-dark-muted mb-4">Retailers and distributors trading under your BOOSTA ecosystem.</p>

      {loading ? (
        <LoadingState />
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" detail="Customers financed through your ecosystem will appear here." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="py-2.5 px-4 font-medium">Customer</th>
                  <th className="py-2.5 px-4 font-medium">Monthly sales</th>
                  <th className="py-2.5 px-4 font-medium">Annual sales</th>
                  <th className="py-2.5 px-4 font-medium">Limit</th>
                  <th className="py-2.5 px-4 font-medium">Outstanding</th>
                  <th className="py-2.5 px-4 font-medium">Utilisation</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.customerId}
                    onClick={() => navigate(`/anchor/customers/${c.customerId}`)}
                    className="border-b border-surface-border dark:border-surface-dark-border last:border-0 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-cocoa dark:text-white text-xs">{c.name}</td>
                    <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs">{formatKES(c.monthlySales)}</td>
                    <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs">{formatKES(c.annualSales)}</td>
                    <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs">{formatKES(c.limit)}</td>
                    <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs">{formatKES(c.outstanding)}</td>
                    <td className="py-2.5 px-4 text-text-light-secondary dark:text-text-dark-secondary text-xs">{c.utilisationPct}%</td>
                    <td className="py-2.5 px-4">
                      <StatusBadge label={c.status.charAt(0) + c.status.slice(1).toLowerCase()} tone={statusTone[c.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AnchorShell>
  )
}
