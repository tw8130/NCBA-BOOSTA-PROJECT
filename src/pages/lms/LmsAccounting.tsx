import { useState } from 'react'
import { BookOpen, Search, CheckCircle2, ShieldCheck, Filter } from 'lucide-react'
import { LmsShell } from '../../components/layout/LmsShell'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatKES, formatDate } from '../../lib/format'
import { useLms } from '../../context/LmsContext'

const GL_FILTERS = [
  { id: 'ALL', label: 'All Accounts' },
  { id: '14101', label: '14101 — Principal Loan Asset' },
  { id: '51002', label: '51002 — Interest Income' },
  { id: '51009', label: '51009 — Penalty Interest (30% p.a.)' },
  { id: '52001', label: '52001 — Facility Fees' },
  { id: '21099', label: '21099 — BOOSTA Control Account' },
]

export default function LmsAccounting() {
  const { glEntries, loading } = useLms()
  const [selectedGl, setSelectedGl] = useState('ALL')
  const [search, setSearch] = useState('')

  if (loading) {
    return (
      <LmsShell title="T24 GL Accounting Mirror">
        <LoadingState />
      </LmsShell>
    )
  }

  const filtered = glEntries.filter((e) => {
    const matchesGl = selectedGl === 'ALL' || e.glCode === selectedGl
    const matchesSearch =
      !search ||
      e.t24FtReference.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.glAccountName.toLowerCase().includes(search.toLowerCase())
    return matchesGl && matchesSearch
  })

  const totalDebits = filtered.reduce((s, e) => s + e.debit, 0)
  const totalCredits = filtered.reduce((s, e) => s + e.credit, 0)
  const isBalanced = totalDebits === totalCredits

  return (
    <LmsShell
      title="T24 Core Banking GL Mirror"
      subtitle="General Ledger entries mirror for Principal, Interest, Penalty (30% p.a.), Facility Fees, and BOOSTA Control Account"
    >
      {/* T24 Reconciled Status Summary Banner */}
      <div className="grid sm:grid-cols-4 gap-3 mb-5">
        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Total Debits
          </p>
          <p className="text-lg font-bold text-cocoa dark:text-white font-mono mt-0.5">
            {formatKES(totalDebits)}
          </p>
          <span className="text-[10px] text-text-light-muted">Asset & settlement entries</span>
        </Card>

        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Total Credits
          </p>
          <p className="text-lg font-bold text-cocoa dark:text-white font-mono mt-0.5">
            {formatKES(totalCredits)}
          </p>
          <span className="text-[10px] text-text-light-muted">Revenue & liability entries</span>
        </Card>

        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Accounting Balance
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 size={16} className="text-mediterranean" />
            <span className="text-sm font-bold text-mediterranean">
              {isBalanced ? 'In Balance (0.00)' : `Variance: ${formatKES(Math.abs(totalDebits - totalCredits))}`}
            </span>
          </div>
          <span className="text-[10px] text-text-light-muted">Double-entry verified</span>
        </Card>

        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Integration Protocol
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ShieldCheck size={16} className="text-sky" />
            <span className="text-sm font-bold text-cocoa dark:text-white">
              T24 Transact API
            </span>
          </div>
          <span className="text-[10px] text-text-light-muted">Real-time FT journal posting</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {GL_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedGl(f.id)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold whitespace-nowrap border transition-colors ${
                selectedGl === f.id
                  ? 'bg-cocoa text-white border-cocoa dark:bg-sky dark:text-cocoa dark:border-sky'
                  : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:bg-black/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-light-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FT ref or narration..."
            className="w-full pl-8 pr-3 py-1.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white text-xs focus:outline-none focus:border-sky"
          />
        </div>
      </div>

      {/* GL Entries Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="py-3 px-3 font-semibold">Value Date</th>
                <th className="py-3 px-3 font-semibold">T24 FT Reference</th>
                <th className="py-3 px-3 font-semibold">GL Code</th>
                <th className="py-3 px-3 font-semibold">GL Account Title</th>
                <th className="py-3 px-3 font-semibold">Journal Narration</th>
                <th className="py-3 px-3 font-semibold text-right">Debit (KES)</th>
                <th className="py-3 px-3 font-semibold text-right">Credit (KES)</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                >
                  <td className="py-3 px-3 text-text-light-secondary dark:text-text-dark-secondary font-mono text-[11px]">
                    {formatDate(e.valueDate)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-mediterranean dark:text-sky">
                    {e.t24FtReference}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-cocoa dark:text-white">
                    {e.glCode}
                  </td>
                  <td className="py-3 px-3 font-medium text-cocoa dark:text-white">
                    {e.glAccountName}
                  </td>
                  <td className="py-3 px-3 text-text-light-secondary dark:text-text-dark-secondary text-[11px] max-w-xs truncate">
                    {e.description}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-cocoa dark:text-white">
                    {e.debit > 0 ? formatKES(e.debit) : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-cocoa dark:text-white">
                    {e.credit > 0 ? formatKES(e.credit) : '—'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge label={e.status} tone="success" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </LmsShell>
  )
}
