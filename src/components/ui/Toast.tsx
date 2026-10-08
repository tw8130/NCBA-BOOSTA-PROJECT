import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'warning' | 'danger' | 'info'

export interface ToastProps {
  type?: ToastType
  title: string
  message?: string
  onClose?: () => void
  className?: string
}

const toastConfigs = {
  success: {
    icon: CheckCircle2,
    border: 'border-mediterranean/30',
    bg: 'bg-mediterranean/10',
    iconColor: 'text-mediterranean',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-sun/40',
    bg: 'bg-sun/15',
    iconColor: 'text-[#8A7800] dark:text-sun',
  },
  danger: {
    icon: AlertCircle,
    border: 'border-coral/30',
    bg: 'bg-coral/10',
    iconColor: 'text-coral',
  },
  info: {
    icon: Info,
    border: 'border-sky/30',
    bg: 'bg-sky/10',
    iconColor: 'text-sky-dark dark:text-sky',
  },
}

export function Toast({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}: ToastProps) {
  const config = toastConfigs[type]
  const Icon = config.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-3 rounded-[4px] border ${config.border} ${config.bg} text-cocoa dark:text-text-dark-primary transition-all duration-150 ${className}`}
    >
      <Icon size={16} strokeWidth={1.75} className={`shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold tracking-tight">{title}</p>
        {message && (
          <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5 leading-relaxed">
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 -mr-1 text-text-light-muted hover:text-cocoa dark:text-text-dark-muted dark:hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
