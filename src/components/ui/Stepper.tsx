export interface StepperProps {
  steps: string[]
  current: number
  showLabels?: boolean
}

export function Stepper({ steps, current, showLabels = false }: StepperProps) {
  return (
    <div className="mb-6 w-full">
      <div className="flex items-center gap-1.5">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-[3px] rounded-[2px] transition-colors duration-200 ${
                i <= current
                  ? 'bg-sky'
                  : 'bg-surface-border dark:bg-surface-dark-border'
              }`}
            />
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex justify-between items-center mt-2 text-[10px] text-text-light-muted dark:text-text-dark-muted font-medium">
          <span>Step {current + 1} of {steps.length}</span>
          <span>{steps[current]}</span>
        </div>
      )}
    </div>
  )
}
