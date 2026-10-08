import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  prefixAddon?: ReactNode
  suffixAddon?: ReactNode
  badgeText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    prefixAddon,
    suffixAddon,
    badgeText,
    id,
    disabled,
    className = '',
    ...rest
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary"
          >
            {label}
          </label>
          {badgeText && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[20px] bg-sky-tint text-cocoa border border-sky/30 dark:bg-sky/20 dark:text-sky">
              {badgeText}
            </span>
          )}
        </div>
      )}
      <div className="relative flex items-center">
        {prefixAddon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-text-light-muted dark:text-text-dark-muted">
            {prefixAddon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`w-full h-[38px] min-h-[44px] sm:min-h-[38px] rounded-[4px] border bg-white dark:bg-surface-dark-paper px-3 text-[13px] text-cocoa dark:text-text-dark-primary placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted transition-colors duration-150 focus:outline-none ${
            prefixAddon ? 'pl-9' : ''
          } ${suffixAddon ? 'pr-9' : ''} ${
            error
              ? 'border-coral focus:border-coral'
              : 'border-surface-border dark:border-surface-dark-border focus:border-sky'
          } ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40'
              : ''
          } ${className}`}
          {...rest}
        />
        {suffixAddon && (
          <div className="absolute right-3 flex items-center text-text-light-muted dark:text-text-dark-muted">
            {suffixAddon}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-[11px] text-coral flex items-center gap-1 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-[10px] text-text-light-muted dark:text-text-dark-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})
