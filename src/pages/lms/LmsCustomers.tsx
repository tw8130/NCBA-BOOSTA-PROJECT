import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, FileEdit, Users } from 'lucide-react'
import { LmsShell } from '../../components/layout/LmsShell'
import { Card } from '../../components/ui/Card'
import { ParBadge } from '../../components/lms/ParBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatKES } from '../../lib/format'
import { useLms } from '../../context/LmsContext'
import type { CbkParGrade } from '../../types'

export default function LmsCustomers() {
  const { customers, loading } = useLms()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<'ALL' | CbkParGrade>('ALL')

  if (loading) {
    return (
      <LmsShell title="Customer Portfolio">
        <LoadingState />
      </LmsShell>
    )
  }

  const filtered = customers.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nationalId.includes(search) ||
      c.anchorName.toLowerCase().includes(search.toLowerCase())

    const matchesGrade = gradeFilter === 'ALL' || c.parGrade === gradeFilter
    return matchesSearch && matchesGrade
  })

  return (
    <LmsShell
      title="Borrower Portfolio Management"
      subtitle="Comprehensive exposure list, CBK classifications, and 30% p.a. default penalty tracking"
    >
      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light-muted dark:text-text-dark-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by borrower name, National ID, or anchor..."
            className="w-full pl-9 pr-3 py-1.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white text-xs focus:outline-none focus:border-sky"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter size={13} className="text-text-light-muted" />
          <span className="text-text-light-muted">CBK Grade:</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value as 'ALL' | CbkParGrade)}
            className="border border-surface-border dark:border-surface-dark-border rounded-[4px] px-2 py-1 bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white text-xs focus:outline-none focus:border-sky"
          >
            <option value="ALL">All Grades ({customers.length})</option>
            <option value="NORMAL">Normal (0–30 DPD)</option>
            <option value="WATCH">Watch (31–90 DPD)</option>
            <option value="SUBSTANDARD">Substandard (91–180 DPD)</option>
            <option value="DOUBTFUL">Doubtful (181–360 DPD)</option>
            <option value="LOSS">Loss (360+ DPD)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <EmptyState
            icon={Users}
            title="No customers match criteria"
            detail="Try clearing your search query or selected CBK classification filter."
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="py-3 px-3 font-semibold">Borrower Name</th>
                  <th className="py-3 px-3 font-semibold">National ID</th>
                  <th className="py-3 px-3 font-semibold">Anchor Partner</th>
                  <th className="py-3 px-3 font-semibold text-right">Limit</th>
                  <th className="py-3 px-3 font-semibold text-right">Outstanding</th>
                  <th className="py-3 px-3 font-semibold text-center">DPD</th>
                  <th className="py-3 px-3 font-semibold">CBK Classification</th>
                  <th className="py-3 px-3 font-semibold text-right">Accrued Penalty (30% p.a.)</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-cocoa dark:text-white">
                      {c.name}
                    </td>
                    <td className="py-3 px-3 text-text-light-secondary dark:text-text-dark-secondary font-mono">
                      {c.nationalId}
                    </td>
                    <td className="py-3 px-3 text-text-light-secondary dark:text-text-dark-secondary">
                      {c.anchorName}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-cocoa dark:text-white font-mono">
                      {formatKES(c.limit)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-text-light-secondary dark:text-text-dark-secondary font-mono">
                      {formatKES(c.outstanding)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span
                        className={`font-semibold ${
                          c.daysOverdue > 0 ? 'text-coral' : 'text-text-light-muted'
                        }`}
                      >
                        {c.daysOverdue} d
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <ParBadge grade={c.parGrade} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium">
                      {c.penaltyAccrued > 0 ? (
                        <span className="text-coral">
                          {formatKES(c.penaltyAccrued)}
                        </span>
                      ) : (
                        <span className="text-text-light-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/lms/limits/new?customerId=${c.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky hover:bg-sky hover:text-cocoa transition-colors text-[11px] font-semibold"
                        title="Amend credit limit for this customer (Maker)"
                      >
                        <FileEdit size={12} />
                        Amend Limit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </LmsShell>
  )
}
