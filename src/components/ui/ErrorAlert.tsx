import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

export function ErrorAlert({
  title,
  detail,
  action,
}: {
  title: string
  detail: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[4px] bg-coral/10 border border-coral/30 p-3.5 flex gap-3 text-cocoa dark:text-text-dark-primary">
      <AlertTriangle className="text-coral shrink-0 mt-0.5" size={18} strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-coral text-[13px]">{title}</p>
        <p className="text-text-light-secondary dark:text-text-dark-secondary text-[12px] mt-0.5 leading-relaxed">
          {detail}
        </p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}
