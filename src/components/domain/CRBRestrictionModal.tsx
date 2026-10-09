import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, MessageSquare, Check, Phone } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatKES } from '../../lib/format'

export function CRBRestrictionModal({
  anchorName,
  limit,
  onClose,
}: {
  anchorName: string
  limit: number
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [smsSent, setSmsSent] = useState(false)

  const simulatedSmsText = `NCBA BOOSTA: Dear Customer, your facility limit with ${anchorName} remains approved at ${formatKES(
    limit
  )}. New drawdowns are temporarily paused pending a credit bureau clearance refresh. Call NCBA Support on 0711 056 444 for assistance.`

  function handleSimulateSms() {
    setSmsSent(true)
  }

  return (
    <Modal title="Drawdown Temporarily Unavailable" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-sun/20 text-cocoa dark:text-sun flex items-center justify-center shrink-0 border border-sun/30">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[13px] text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
              Your {anchorName} BOOSTA limit of{' '}
              <span className="font-bold text-cocoa dark:text-white">{formatKES(limit)}</span> is still
              valid and reserved on your facility. However, new drawdowns are temporarily paused
              because there is an outstanding credit-reference notice that requires clearance.
            </p>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary leading-relaxed mt-2">
              Under NCBA credit policy, your approved limit is not cancelled. Once the credit bureau record is refreshed, drawdowns resume immediately without requiring a new onboarding application.
            </p>
          </div>
        </div>

        {/* SMS Simulation Block */}
        <div className="p-3 bg-surface-light dark:bg-white/[0.03] border border-surface-border dark:border-surface-dark-border rounded-[4px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cocoa dark:text-text-dark-primary flex items-center gap-1.5 uppercase tracking-wide">
              <MessageSquare size={13} className="text-sky" /> Customer SMS Simulation
            </span>
            {smsSent ? (
              <span className="text-[10px] text-mediterranean font-semibold flex items-center gap-1">
                <Check size={12} /> SMS Dispatched
              </span>
            ) : (
              <button
                onClick={handleSimulateSms}
                className="text-[11px] font-semibold text-sky hover:underline"
              >
                Send SMS to phone
              </button>
            )}
          </div>
          <div className="p-2.5 bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border rounded-[4px] font-mono text-[11px] text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
            {simulatedSmsText}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            full
            onClick={() => {
              onClose()
              navigate('/customer/support')
            }}
          >
            <Phone size={13} className="mr-1 inline" /> Contact Support
          </Button>
          <Button full onClick={onClose}>
            Understood
          </Button>
        </div>
      </div>
    </Modal>
  )
}
