import { useNavigate } from 'react-router-dom'
import { Landmark, Wallet } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { AnchorCard } from '../components/domain/AnchorCard'
import { CRBRestrictionModal } from '../components/domain/CRBRestrictionModal'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { useApp } from '../context/AppContext'

export default function Anchors() {
  const navigate = useNavigate()
  const { anchors, loans, loading } = useApp()
  const [crbModalAnchorId, setCrbModalAnchorId] = useState<string | null>(null)
  const modalAnchor = anchors.find((a) => a.id === crbModalAnchorId)

  return (
    <AppShell title="Approved Anchors">
      <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mb-4">
        Corporate suppliers linked to your business. Each anchor maintains its own approved and available limit.
      </p>

      {loading ? (
        <LoadingState />
      ) : anchors.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No anchors identified"
          detail="Anchors linked to your business will appear here once verified through trading records."
        />
      ) : (
        <div className="space-y-3.5 max-w-xl">
          {anchors.map((a) => (
            <div key={a.id} className="p-3.5 rounded-[6px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper">
              <AnchorCard
                anchor={a}
                activeLoanCount={loans.filter((l) => l.anchorId === a.id && l.status === 'ACTIVE').length}
                onClick={() => navigate(`/customer/anchors/${a.id}`)}
              />
              <div className="flex gap-2 mt-3 pt-2.5 border-t border-surface-border dark:border-surface-dark-border">
                <button
                  onClick={() => navigate(`/customer/anchors/${a.id}`)}
                  className="flex-1 py-1.5 rounded-[4px] bg-surface-light dark:bg-white/5 border border-surface-border dark:border-white/10 text-cocoa dark:text-white text-[12px] font-medium flex items-center justify-center gap-1 hover:border-sky/40 transition-colors"
                >
                  <Landmark size={13} /> View anchor
                </button>
                <button
                  onClick={() => (a.drawdownAllowed ? navigate(`/customer/drawdown?anchor=${a.id}`) : setCrbModalAnchorId(a.id))}
                  className={`flex-1 py-1.5 rounded-[4px] text-[12px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                    a.drawdownAllowed
                      ? 'bg-sky text-cocoa hover:bg-sky-hover'
                      : 'bg-black/5 dark:bg-white/5 text-text-light-muted dark:text-text-dark-muted border border-surface-border dark:border-white/10'
                  }`}
                >
                  <Wallet size={13} /> Draw down
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAnchor && (
        <CRBRestrictionModal
          anchorName={modalAnchor.name}
          limit={modalAnchor.approvedLimit}
          onClose={() => setCrbModalAnchorId(null)}
        />
      )}
    </AppShell>
  )
}
