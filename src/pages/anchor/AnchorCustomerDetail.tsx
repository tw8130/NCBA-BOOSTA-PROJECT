import { useParams } from 'react-router-dom'
import { UserX } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { SalesChart } from '../../components/anchor/SalesChart'
import { formatKES } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'
import type { AnchorCustomer } from '../../types'

const statusTone: Record<AnchorCustomer['status'], 'success' | 'neutral' | 'danger'> = {
  ACTIVE: 'success',
  DORMANT: 'neutral',
  RESTRICTED: 'danger',
}

export default function AnchorCustomerDetail() {
  const { id } = useParams()
  const { customers, monthlySales, loading } = useAnchorPortal()

  if (loading) {
    return (
      <AnchorShell title="Customer" back>
        <LoadingState />
      </AnchorShell>
    )
  }

  const customer = customers.find((c) => c.customerId === id)
  if (!customer) {
    return (
      <AnchorShell title="Customer" back>
        <EmptyState icon={UserX} title="Customer not found" detail="This customer record could not be located." />
      </AnchorShell>
    )
  }

  return (
    <AnchorShell title={customer.name} back>
      <div className="max-w-3xl space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-cocoa dark:text-white text-lg">{customer.name}</p>
              <p className="text-xs text-text-light-muted dark:text-text-dark-muted">Customer ID: {customer.customerId}</p>
            </div>
            <StatusBadge label={customer.status.charAt(0) + customer.status.slice(1).toLowerCase()} tone={statusTone[customer.status]} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Monthly sales" value={formatKES(customer.monthlySales)} />
            <Stat label="Annual sales" value={formatKES(customer.annualSales)} />
            <Stat label="Limit" value={formatKES(customer.limit)} />
            <Stat label="Outstanding" value={formatKES(customer.outstanding)} />
          </div>
          <div className="mt-4">
            <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-sky rounded-full" style={{ width: `${customer.utilisationPct}%` }} />
            </div>
            <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-1">{customer.utilisationPct}% of limit utilised</p>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Sales trend (ecosystem-wide, for reference)</p>
          <SalesChart data={monthlySales} style="line" height={180} />
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
