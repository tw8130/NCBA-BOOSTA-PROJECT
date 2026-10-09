// -----------------------------------------------------------------------------
// NCBA BOOSTA — Security PIN Input Field with Reveal Toggle
// -----------------------------------------------------------------------------

import { useState, type ChangeEvent } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { PIN_LENGTH } from '../../lib/validators'

interface PinFieldProps {
  label?: string
  value: string
  onChange: (pin: string) => void
  error?: string
  helperText?: string
  placeholder?: string
  id?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function PinField({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder = '••••',
  id = 'pin-field',
  disabled = false,
  autoFocus = false,
}: PinFieldProps) {
  const [showPin, setShowPin] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH)
    onChange(digitsOnly)
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none text-text-light-muted dark:text-text-dark-muted">
          <Lock size={15} />
        </div>

        <input
          id={id}
          type={showPin ? 'text' : 'password'}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={PIN_LENGTH}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`w-full h-[42px] sm:h-[38px] rounded-[4px] border bg-white dark:bg-surface-dark-paper pl-9 pr-10 text-[15px] font-mono tracking-widest text-cocoa dark:text-text-dark-primary transition-colors focus:outline-none ${
            error
              ? 'border-coral bg-coral-tint/10 text-coral focus:border-coral'
              : 'border-surface-border dark:border-surface-dark-border focus:border-sky'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40' : ''}`}
        />

        <button
          type="button"
          onClick={() => setShowPin((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={showPin ? 'Hide PIN' : 'Reveal PIN'}
          className="absolute right-2.5 p-1 text-text-light-muted hover:text-cocoa dark:text-text-dark-muted dark:hover:text-white transition-colors"
        >
          {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-coral font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1 text-[10px] text-text-light-muted dark:text-text-dark-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
