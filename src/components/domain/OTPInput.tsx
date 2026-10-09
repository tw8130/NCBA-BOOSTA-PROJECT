// -----------------------------------------------------------------------------
// NCBA BOOSTA — Split 6-Digit OTP Input Component
// -----------------------------------------------------------------------------

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { OTP_LENGTH } from '../../lib/validators'

interface OTPInputProps {
  value: string
  onChange: (otp: string) => void
  disabled?: boolean
  hasError?: boolean
  autoFocus?: boolean
}

export function OTPInput({
  value,
  onChange,
  disabled = false,
  hasError = false,
  autoFocus = true,
}: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '')

  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0].focus()
    }
  }, [autoFocus, disabled])

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus()
      } else {
        const next = [...digits]
        next[index] = ''
        onChange(next.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleInput(index: number, char: string) {
    const digit = char.replace(/\D/g, '').slice(-1)
    if (!digit) return

    const next = [...digits]
    next[index] = digit
    const joined = next.join('')
    onChange(joined)

    if (index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pasted) {
      onChange(pasted)
      const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1)
      inputsRef.current[nextFocus]?.focus()
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full max-w-sm mx-auto">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
        const val = digits[index] || ''
        const isCurrentActive = !disabled && (val !== '' || index === value.length)

        return (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={val}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-11 sm:w-12 h-13 sm:h-14 text-center text-[20px] font-bold rounded-[4px] border transition-all duration-150 focus:outline-none ${
              hasError
                ? 'border-coral bg-coral-tint/20 text-coral focus:border-coral'
                : isCurrentActive
                ? 'border-sky bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary ring-1 ring-sky/30'
                : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary'
            } ${
              disabled
                ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50'
                : 'hover:border-sky/50'
            }`}
          />
        )
      })}
    </div>
  )
}
