import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Check,
  FileCheck,
} from 'lucide-react'
import { LmsShell } from '../../components/layout/LmsShell'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { formatKES, formatDateTime } from '../../lib/format'
import { useLms } from '../../context/LmsContext'
import type { LmsException } from '../../types'

export default function LmsExceptions() {
  const { exceptions, resolveException, loading } = useLms()
  const [filter, setFilter] = useState<'ALL' | 'UNMATCHED' | 'INVESTIGATING' | 'MATCHED'>('ALL')
  const [search, setSearch] = useState('')
  const [selectedException, setSelectedException] = useState<LmsException | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolving, setResolving] = useState(false)

  if (loading) {
    return (
      <LmsShell title="Gateway Reconciliation Exceptions">
        <LoadingState />
      </LmsShell>
    )
  }

  const filtered = exceptions.filter((e) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'UNMATCHED' && e.status === 'UNMATCHED') ||
      (filter === 'INVESTIGATING' && e.status === 'INVESTIGATING') ||
      (filter === 'MATCHED' && (e.status === 'MATCHED' || e.status === 'MANUAL_OVERRIDE'))

    const matchesSearch =
      !search ||
      e.t24FtReference.toLowerCase().includes(search.toLowerCase()) ||
      e.gatewayReference.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const openExceptionsCount = exceptions.filter(
    (e) => e.status === 'UNMATCHED' || e.status === 'INVESTIGATING'
  ).length

  const totalVariance = exceptions
    .filter((e) => e.status !== 'MATCHED' && e.status !== 'MANUAL_OVERRIDE')
    .reduce((s, e) => s + e.variance, 0)

  async function handleConfirmResolve() {
    if (!selectedException) return
    try {
      setResolving(true)
      await resolveException(
        selectedException.id,
        resolutionNotes || 'Manually verified against Safaricom Daraja portal receipt.'
      )
      setSelectedException(null)
      setResolutionNotes('')
    } finally {
      setResolving(false)
    }
  }

  return (
    <LmsShell
      title="Gateway & T24 Core Reconciliation Exceptions"
      subtitle="Matching T24 FT references against Safaricom Daraja B2C/C2B mobile transaction logs"
    >
      {/* Top Reconciliation KPI Cards */}
      <div className="grid sm:grid-cols-4 gap-3 mb-5">
        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Automated Match Rate
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-extrabold text-mediterranean dark:text-sky font-mono">
              98.4%
            </span>
            <span className="text-[10px] text-mediterranean font-semibold">T24 vs Daraja</span>
          </div>
          <span className="text-[10px] text-text-light-muted">Target SLA: &gt; 98.0%</span>
        </Card>

        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Open Exceptions
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-extrabold text-coral font-mono">
              {openExceptionsCount}
            </span>
            <span className="text-[10px] text-coral font-semibold">Requires investigation</span>
          </div>
          <span className="text-[10px] text-text-light-muted">24h resolution window</span>
        </Card>

        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Total Variance Exposure
          </p>
          <p className="text-xl font-bold text-cocoa dark:text-white font-mono mt-0.5">
            {formatKES(totalVariance)}
          </p>
          <span className="text-[10px] text-text-light-muted">Pending settlement credit</span>
        </Card>

        <Card className="p-3.5">
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
            Reconciliation Engine
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <RefreshCw size={15} className="text-mediterranean animate-spin" />
            <span className="text-sm font-bold text-cocoa dark:text-white">
              Continuous Polling
            </span>
          </div>
          <span className="text-[10px] text-text-light-muted">Last sync: 1 min ago</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'INVESTIGATING', 'UNMATCHED', 'MATCHED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold capitalize border transition-colors ${
                filter === f
                  ? 'bg-cocoa text-white border-cocoa dark:bg-sky dark:text-cocoa dark:border-sky'
                  : 'bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary border-surface-border dark:border-surface-dark-border hover:bg-black/5'
              }`}
            >
              {f.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-light-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FT or Gateway ref..."
            className="w-full pl-8 pr-3 py-1.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white text-xs focus:outline-none focus:border-sky"
          />
        </div>
      </div>

      {/* Exceptions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-text-light-muted dark:text-text-dark-muted border-b border-surface-border dark:border-surface-dark-border bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="py-3 px-3 font-semibold">T24 FT Reference</th>
                <th className="py-3 px-3 font-semibold">Gateway Mobile Ref</th>
                <th className="py-3 px-3 font-semibold">Borrower</th>
                <th className="py-3 px-3 font-semibold">Channel</th>
                <th className="py-3 px-3 font-semibold text-right">T24 Amount</th>
                <th className="py-3 px-3 font-semibold text-right">Gateway Amount</th>
                <th className="py-3 px-3 font-semibold text-right">Variance</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {filtered.map((e) => {
                const isOpen = e.status === 'INVESTIGATING' || e.status === 'UNMATCHED'
                return (
                  <tr
                    key={e.id}
                    className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-mediterranean dark:text-sky">
                      {e.t24FtReference}
                      <span className="text-[10px] text-text-light-muted block font-normal">
                        {formatDateTime(e.timestamp)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-cocoa dark:text-white">
                      {e.gatewayReference}
                    </td>
                    <td className="py-3 px-3 font-medium text-cocoa dark:text-white">
                      {e.customerName}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
                      {e.channel}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-cocoa dark:text-white">
                      {formatKES(e.t24Amount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-cocoa dark:text-white">
                      {formatKES(e.gatewayAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {e.variance > 0 ? (
                        <span className="text-coral">+{formatKES(e.variance)}</span>
                      ) : (
                        <span className="text-mediterranean">0.00</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        label={
                          e.status === 'INVESTIGATING'
                            ? 'Investigating'
                            : e.status === 'UNMATCHED'
                            ? 'Unmatched'
                            : e.status === 'MANUAL_OVERRIDE'
                            ? 'Manual Override'
                            : 'Matched'
                        }
                        tone={
                          e.status === 'INVESTIGATING'
                            ? 'warning'
                            : e.status === 'UNMATCHED'
                            ? 'danger'
                            : 'success'
                        }
                      />
                      {e.reason && (
                        <p className="text-[10px] text-text-light-muted mt-1 max-w-xs truncate" title={e.reason}>
                          {e.reason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isOpen ? (
                        <button
                          onClick={() => {
                            setSelectedException(e)
                            setResolutionNotes(
                              'Verified against Safaricom Daraja API callback. Settlement variance approved for manual reconciliation.'
                            )
                          }}
                          className="px-2.5 py-1 rounded-[3px] bg-cocoa text-white dark:bg-sky dark:text-cocoa text-[11px] font-bold hover:opacity-90 transition-opacity"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-mediterranean text-[11px] font-semibold flex items-center justify-end gap-1">
                          <Check size={12} /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resolution Modal */}
      {selectedException && (
        <Modal
          title="Resolve Gateway Reconciliation Exception"
          onClose={() => setSelectedException(null)}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-[4px] bg-surface-light dark:bg-surface-dark-bg border border-surface-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-light-muted">T24 Reference:</span>
                <span className="font-mono font-bold text-mediterranean">
                  {selectedException.t24FtReference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted">Gateway Ref:</span>
                <span className="font-mono font-bold text-cocoa dark:text-white">
                  {selectedException.gatewayReference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted">Customer:</span>
                <span className="font-semibold text-cocoa dark:text-white">
                  {selectedException.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light-muted">Variance:</span>
                <span className="font-mono font-bold text-coral">
                  {formatKES(selectedException.variance)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-cocoa dark:text-white mb-1">
                Resolution Justification & Audit Memo <span className="text-coral">*</span>
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2.5 rounded-[4px] border border-surface-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky leading-relaxed"
                placeholder="Enter audit reconciliation note..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setSelectedException(null)}
                className="px-3 py-1.5 rounded-[4px] border border-surface-border text-xs text-text-light-muted"
              >
                Cancel
              </button>
              <Button disabled={resolving} onClick={handleConfirmResolve}>
                {resolving ? 'Reconciling…' : 'Confirm Manual Override'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </LmsShell>
  )
}
