import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatKES } from '../../lib/format'
import { useAnchorPortal } from '../../context/AnchorContext'
import type { AnchorCustomer, OverdueAgeing } from '../../types'

const PAGE_SIZE = 5

type CustomerFilterTab = 'ALL' | 'ACTIVE' | 'RESTRICTED' | 'DORMANT' | 'OVERDUE'

const agingBadgeMeta: Record<OverdueAgeing, { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
  Current: { tone: 'success', label: 'Current (0 DPD)' },
  '1-30 DPD': { tone: 'warning', label: '1–30 DPD' },
  '31-60 DPD': { tone: 'danger', label: '31–60 DPD' },
  '61-90 DPD': { tone: 'danger', label: '61–90 DPD' },
  '90+ DPD': { tone: 'danger', label: '90+ DPD (Default)' },
}

const statusTone: Record<AnchorCustomer['status'], 'success' | 'neutral' | 'danger'> = {
  ACTIVE: 'success',
  DORMANT: 'neutral',
  RESTRICTED: 'danger',
}

export default function AnchorCustomers() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialFilter = (params.get('filter') as CustomerFilterTab) || 'ALL'

  const { customers, loading } = useAnchorPortal()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<CustomerFilterTab>(initialFilter)
  const [currentPage, setCurrentPage] = useState(1)

  // Obligation alerts calculation
  const overdueCustomers = useMemo(() => {
    return customers.filter((c) => c.overdueAgeing !== 'Current')
  }, [customers])

  const totalOverdueAmount = useMemo(() => {
    return overdueCustomers.reduce((s, c) => s + c.outstanding, 0)
  }, [overdueCustomers])

  // Filtering logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Category filter
      if (filterTab === 'ACTIVE' && c.status !== 'ACTIVE') return false
      if (filterTab === 'RESTRICTED' && c.status !== 'RESTRICTED') return false
      if (filterTab === 'DORMANT' && c.status !== 'DORMANT') return false
      if (filterTab === 'OVERDUE' && c.overdueAgeing === 'Current') return false

      // Search query (matches Name or National ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = c.name.toLowerCase().includes(q)
        const matchesId = c.nationalId.toLowerCase().includes(q)
        return matchesName || matchesId
      }

      return true
    })
  }, [customers, filterTab, searchQuery])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE))
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredCustomers.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredCustomers, currentPage])

  function handleFilterChange(tab: CustomerFilterTab) {
    setFilterTab(tab)
    setCurrentPage(1)
  }

  function handleSearchChange(val: string) {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  return (
    <AnchorShell title="Customer Portfolio">
      <div className="space-y-4 max-w-5xl">
        {/* Header Description & Data Minimisation Notice */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-extrabold text-cocoa dark:text-white">
              Retailer Portfolio & Exposure
            </h1>
            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Financed buyer roster trading under your supply chain network.
            </p>
          </div>
          <div className="p-2 rounded-[4px] bg-sky-tint/40 dark:bg-sky/15 border border-sky/30 flex items-center gap-1.5 text-[11px] text-cocoa dark:text-sky">
            <ShieldCheck size={14} className="shrink-0 text-sky" />
            <span>Data Minimisation Enforced (Anchor-Authorized Scope Only)</span>
          </div>
        </div>

        {/* Upcoming / Overdue Obligation Alerts Card */}
        {overdueCustomers.length > 0 && (
          <div className="p-3.5 rounded-[6px] bg-coral/10 border border-coral/30 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-coral shrink-0" />
              <div>
                <p className="text-xs font-bold text-coral">
                  Upcoming & Overdue Obligation Alerts ({overdueCustomers.length} Accounts Affected)
                </p>
                <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
                  Total past-due financing exposure: <span className="font-bold text-coral">{formatKES(totalOverdueAmount)}</span>. Accounts with &gt;30 DPD have their drawdown privileges automatically locked.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFilterChange('OVERDUE')}
              className={`px-3 py-1 rounded-[4px] text-xs font-semibold border transition-colors shrink-0 ${
                filterTab === 'OVERDUE'
                  ? 'bg-coral text-white border-coral'
                  : 'bg-white dark:bg-surface-dark-paper text-coral border-coral/40 hover:bg-coral/10'
              }`}
            >
              Filter Overdue Accounts ({overdueCustomers.length})
            </button>
          </div>
        )}

        {/* Controls: Search & Tabs */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { id: 'ALL', label: `All (${customers.length})` },
                { id: 'ACTIVE', label: `Active (${customers.filter((c) => c.status === 'ACTIVE').length})` },
                { id: 'OVERDUE', label: `Overdue (${overdueCustomers.length})` },
                { id: 'RESTRICTED', label: `Restricted (${customers.filter((c) => c.status === 'RESTRICTED').length})` },
                { id: 'DORMANT', label: `Dormant (${customers.filter((c) => c.status === 'DORMANT').length})` },
              ] as { id: CustomerFilterTab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => handleFilterChange(t.id)}
                className={`px-3 py-1.5 rounded-[20px] text-xs font-semibold whitespace-nowrap border transition-all ${
                  filterTab === t.id
                    ? 'bg-sky text-cocoa border-sky shadow-sm'
                    : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-sky/30'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search
              size={14}
              className="absolute left-2.5 top-2.5 text-text-light-muted dark:text-text-dark-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or National ID..."
              className="w-full h-8 pl-8 pr-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-xs text-cocoa dark:text-white placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted focus:outline-none focus:border-sky"
            />
          </div>
        </div>

        {/* Portfolio Table */}
        {loading ? (
          <LoadingState />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No matching customers"
            detail="Try adjusting your search criteria or filter tabs."
          />
        ) : (
          <Card className="p-0 overflow-hidden border border-surface-border dark:border-surface-dark-border">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-white/[0.02] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Customer Name</th>
                    <th className="py-3 px-4 font-bold">National ID</th>
                    <th className="py-3 px-4 font-bold">Facility Limit</th>
                    <th className="py-3 px-4 font-bold">Utilisation %</th>
                    <th className="py-3 px-4 font-bold">Overdue Ageing</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {paginatedCustomers.map((c) => {
                    const agingMeta = agingBadgeMeta[c.overdueAgeing]
                    return (
                      <tr
                        key={c.customerId}
                        onClick={() => navigate(`/anchor/customers/${c.customerId}`)}
                        className="cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky font-bold flex items-center justify-center text-xs shrink-0">
                              {c.name.charAt(0)}
                            </div>
                            <span className="font-bold text-cocoa dark:text-white truncate">
                              {c.name}
                            </span>
                          </div>
                        </td>

                        {/* National ID */}
                        <td className="py-3 px-4 font-mono text-text-light-secondary dark:text-text-dark-secondary">
                          {c.nationalId}
                        </td>

                        {/* Limit */}
                        <td className="py-3 px-4 font-semibold text-cocoa dark:text-white">
                          {formatKES(c.limit)}
                        </td>

                        {/* Utilisation % */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cocoa dark:text-white min-w-[32px]">
                              {c.utilisationPct}%
                            </span>
                            <div className="w-16 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  c.utilisationPct > 80
                                    ? 'bg-coral'
                                    : c.utilisationPct > 40
                                    ? 'bg-sky'
                                    : 'bg-mediterranean'
                                }`}
                                style={{ width: `${Math.min(100, c.utilisationPct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Overdue Ageing */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge label={agingMeta.label} tone={agingMeta.tone} />
                            {c.daysOverdue && (
                              <span className="text-[10px] text-coral font-bold">
                                ({c.daysOverdue}d)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <StatusBadge
                            label={c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                            tone={statusTone[c.status]}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between text-xs text-text-light-secondary dark:text-text-dark-secondary">
              <span>
                Showing{' '}
                <span className="font-bold text-cocoa dark:text-white">
                  {Math.min(filteredCustomers.length, (currentPage - 1) * PAGE_SIZE + 1)}–
                  {Math.min(filteredCustomers.length, currentPage * PAGE_SIZE)}
                </span>{' '}
                of <span className="font-bold text-cocoa dark:text-white">{filteredCustomers.length}</span>{' '}
                retailers
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-cocoa dark:text-white"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-6 h-6 rounded-[3px] font-semibold text-xs transition-colors ${
                        currentPage === page
                          ? 'bg-sky text-cocoa font-bold'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-text-light-secondary dark:text-text-dark-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-cocoa dark:text-white"
                  aria-label="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AnchorShell>
  )
}
