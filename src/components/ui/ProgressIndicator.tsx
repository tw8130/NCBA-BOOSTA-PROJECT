import { Check } from 'lucide-react'

export interface TimelineStep {
  label: string
  detail?: string
  state: 'done' | 'current' | 'upcoming'
}

export function ProgressIndicator({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                step.state === 'done'
                  ? 'bg-sky border-sky text-cocoa'
                  : step.state === 'current'
                    ? 'bg-sky-tint border-sky text-cocoa ring-1 ring-sky/50'
                    : 'bg-black/5 dark:bg-white/5 border-surface-border dark:border-surface-dark-border text-text-light-muted dark:text-text-dark-muted'
              }`}
            >
              {step.state === 'done' ? (
                <Check size={13} strokeWidth={2.5} />
              ) : (
                <span className="text-[10px] font-bold">{i + 1}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-[2px] flex-1 min-h-[24px] ${
                  step.state === 'done'
                    ? 'bg-sky'
                    : 'bg-surface-border dark:bg-surface-dark-border'
                }`}
              />
            )}
          </div>
          <div className="pb-5">
            <p
              className={`text-[13px] font-semibold tracking-tight ${
                step.state === 'upcoming'
                  ? 'text-text-light-muted dark:text-text-dark-muted'
                  : 'text-cocoa dark:text-text-dark-primary'
              }`}
            >
              {step.label}
            </p>
            {step.detail && (
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5 leading-normal">
                {step.detail}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
