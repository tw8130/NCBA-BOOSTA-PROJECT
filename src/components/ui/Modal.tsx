import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const maxWidthMap = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = 'md',
}: ModalProps) {
  // ESC key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`bg-white dark:bg-surface-dark-paper w-full ${maxWidthMap[maxWidth]} rounded-t-[6px] sm:rounded-[6px] border border-surface-border dark:border-surface-dark-border max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between p-4 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <h3
              id="modal-title"
              className="text-[15px] font-semibold text-cocoa dark:text-text-dark-primary tracking-tight"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-[12px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 rounded-[4px] text-text-light-muted hover:text-cocoa dark:text-text-dark-muted dark:hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
