import { CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, WifiOff } from 'lucide-react'
import type { StkStage } from '../../types'

const stageMeta: Record<StkStage, { icon: typeof CheckCircle2; color: string; animate?: boolean }> = {
  IDLE: { icon: Clock, color: 'text-text-light-muted dark:text-text-dark-muted' },
  SENDING: { icon: Loader2, color: 'text-sky', animate: true },
  SENT: { icon: Loader2, color: 'text-sky', animate: true },
  WAITING_CONFIRMATION: { icon: Loader2, color: 'text-sky', animate: true },
  WRONG_PIN: { icon: XCircle, color: 'text-coral' },
  CANCELLED: { icon: XCircle, color: 'text-coral' },
  TIMEOUT: { icon: WifiOff, color: 'text-cocoa dark:text-sun' },
  INSUFFICIENT_FUNDS: { icon: AlertTriangle, color: 'text-cocoa dark:text-sun' },
  SYSTEM_FAILURE: { icon: AlertTriangle, color: 'text-coral' },
  SUCCESS: { icon: CheckCircle2, color: 'text-mediterranean' },
}

export function PaymentStatusIcon({ stage, size = 48 }: { stage: StkStage; size?: number }) {
  const meta = stageMeta[stage]
  const Icon = meta.icon
  return (
    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 ${meta.color}`}>
      <Icon size={size} className={meta.animate ? 'animate-spin' : ''} />
    </div>
  )
}
