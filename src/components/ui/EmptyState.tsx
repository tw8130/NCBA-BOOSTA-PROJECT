import type { ElementType, ReactNode } from 'react'

export interface EmptyStateProps {
  icon: ElementType
  title: string
  detail: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  detail,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-8 px-4 rounded-[6px] border border-dashed border-surface-border dark:border-surface-dark-border bg-black/[0.01] dark:bg-white/[0.01] ${className}`}
    >
      <div className="mx-auto w-10 h-10 rounded-[20px] bg-sky-tint dark:bg-sky/10 border border-sky/30 flex items-center justify-center text-cocoa dark:text-sky mb-3">
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <h3 className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary mb-1">
        {title}
      </h3>
      <p className="text-[12px] text-text-light-muted dark:text-text-dark-muted max-w-sm mx-auto mb-4">
        {detail}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
