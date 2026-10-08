import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Stepper } from '../../components/ui/Stepper'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'

const CORRECT_OTP = '123456'

export default function Otp() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = (location.state as { phone?: string })?.phone || '0712 345 678'

  const [otp, setOtp] = useState('')
  const [error, setError] = useState<'invalid' | 'expired' | null>(null)
  const [seconds, setSeconds] = useState(45)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  function verify() {
    setVerifying(true)
    setError(null)
    setTimeout(() => {
      setVerifying(false)
      if (seconds <= 0) {
        setError('expired')
      } else if (otp !== CORRECT_OTP) {
        setError('invalid')
      } else {
        navigate('/customer/create-pin')
      }
    }, 900)
  }

  function resend() {
    setSeconds(45)
    setError(null)
    setOtp('')
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary px-4 py-8 transition-colors flex flex-col justify-center">
      <div className="max-w-sm mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={0} />
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">Verification</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Enter Confirmation Code
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            We've sent a 6-digit code to <span className="font-semibold text-cocoa dark:text-white">{phone}</span>.
          </p>
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-1 bg-sky-tint/50 dark:bg-sky/10 border border-sky/20 px-2 py-1 rounded-[4px]">
            Prototype demo code: <span className="font-bold text-cocoa dark:text-sky">123456</span>
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border rounded-[6px] p-5 mb-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="w-full mb-3 px-3 py-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary text-xl tracking-[0.5em] text-center focus:outline-none focus:border-sky"
          />

          {error === 'invalid' && (
            <p className="text-[11px] text-coral mb-3 font-medium">That code is incorrect. Please try again or request a new code.</p>
          )}
          {error === 'expired' && (
            <p className="text-[11px] text-coral mb-3 font-medium">This code has expired. Request a new code below.</p>
          )}

          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
              {seconds > 0 ? `Expires in ${seconds}s` : 'Code expired'}
            </span>
            <button
              onClick={resend}
              disabled={seconds > 0}
              className="text-[11px] font-semibold text-cocoa dark:text-sky underline decoration-sky disabled:text-text-light-muted dark:disabled:text-text-dark-muted disabled:no-underline"
            >
              Resend code
            </button>
          </div>

          <Button full disabled={otp.length < 6 || verifying} loading={verifying} onClick={verify}>
            Verify and continue
          </Button>
        </div>
      </div>
    </div>
  )
}
