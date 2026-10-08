import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantStyles: Record<ButtonVariant, string> = {
  // A5 rule: Sky background with Cocoa text (5.4:1 WCAG AA). White on Sky is only 2.4:1 (FORBIDDEN).
  primary: 'bg-sky text-cocoa font-semibold hover:bg-sky-hover active:bg-sky-dark border border-sky/30 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600',
  secondary: 'bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary border border-surface-border dark:border-surface-dark-border hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-50',
  danger: 'bg-coral text-white font-semibold hover:bg-coral-hover active:opacity-90 border border-coral/30 disabled:opacity-50',
  ghost: 'bg-transparent text-cocoa dark:text-text-dark-primary hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40',
  accent: 'bg-sun text-cocoa font-semibold hover:bg-sun-dark border border-sun/40 disabled:opacity-50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-[11px] min-h-[32px] sm:min-h-[32px]',
  md: 'px-4 py-2 text-[13px] min-h-[44px] sm:min-h-[38px]',
  lg: 'px-5 py-2.5 text-[14px] min-h-[48px] sm:min-h-[44px]',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[4px] transition-all duration-150 active:translate-y-[1px] disabled:pointer-events-none disabled:active:translate-y-0 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${full ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
}
