import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options?: SelectOption[]
  error?: string
  helperText?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options = [], error, helperText, id, disabled, children, className = '', ...rest },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={`w-full h-[38px] min-h-[44px] sm:min-h-[38px] appearance-none rounded-[4px] border bg-white dark:bg-surface-dark-paper px-3 pr-8 text-[13px] text-cocoa dark:text-text-dark-primary transition-colors duration-150 focus:outline-none ${
            error
              ? 'border-coral focus:border-coral'
              : 'border-surface-border dark:border-surface-dark-border focus:border-sky'
          } ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40'
              : 'cursor-pointer'
          } ${className}`}
          {...rest}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-2.5 pointer-events-none text-text-light-muted dark:text-text-dark-muted"
        />
      </div>
      {error ? (
        <p className="mt-1 text-[11px] text-coral font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-[10px] text-text-light-muted dark:text-text-dark-muted">{helperText}</p>
      ) : null}
    </div>
  )
})
