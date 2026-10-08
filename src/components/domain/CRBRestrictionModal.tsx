import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatKES } from '../../lib/format'

export function CRBRestrictionModal({ anchorName, limit, onClose }: { anchorName: string; limit: number; onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <Modal title="Drawdown temporarily unavailable" onClose={onClose}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-sun/20 text-cocoa dark:text-sun flex items-center justify-center shrink-0">
          <ShieldAlert size={18} />
        </div>
        <div>
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
            Your {anchorName} BOOSTA limit of <span className="font-semibold text-cocoa dark:text-white">{formatKES(limit)}</span> is
            still valid and available on your account. However, drawdown is temporarily unavailable because there is an
            outstanding credit-reference issue that needs to be resolved.
          </p>
          <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed mt-3">
            To continue using this facility, please clear the outstanding credit-reference issue. Once your status is
            updated, your eligibility can be reassessed.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" full onClick={() => navigate('/customer/support')}>Contact support</Button>
        <Button full onClick={onClose}>Got it</Button>
      </div>
    </Modal>
  )
}
