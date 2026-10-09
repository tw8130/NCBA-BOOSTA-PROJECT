// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 2: 6-Digit OTP Verification (65/35 Layout)
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, ShieldAlert, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { OTPInput } from '../../components/domain/OTPInput'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import { DEMO_OTP, DEMO_EXPIRED_OTP, OTP_LENGTH, OTP_RESEND_SECONDS } from '../../lib/validators'
import { onboardingApi } from '../../services/onboardingApi'

export default function Otp() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isResetMode = searchParams.get('purpose') === 'reset'

  const { state, setOtpVerified } = useOnboarding()
  const phone = state.phone || '0712 345 678'

  const [otp, setOtp] = useState('')
  const [errorStatus, setErrorStatus] = useState<'INVALID' | 'EXPIRED' | 'LOCKED' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(OTP_RESEND_SECONDS)
  const [verifying, setVerifying] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)

  // Countdown timer for 45s resend cooldown
  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [seconds])

  async function handleVerify() {
    if (otp.length !== OTP_LENGTH) return

    setVerifying(true)
    setErrorStatus(null)
    setErrorMessage(null)

    const res = await onboardingApi.verifyOtp(phone, otp, failedAttempts)
    setVerifying(false)

    if (res.success) {
      setOtpVerified(true)
      navigate(isResetMode ? '/customer/create-pin?purpose=reset' : '/customer/create-pin')
    } else {
      if (res.codeStatus !== 'VALID') {
        setErrorStatus(res.codeStatus)
      }
      setErrorMessage(res.message)
      setFailedAttempts((prev) => prev + 1)
    }
  }

  function handleResend() {
    setSeconds(OTP_RESEND_SECONDS)
    setErrorStatus(null)
    setErrorMessage(null)
    setOtp('')
    setFailedAttempts(0)
    onboardingApi.sendOtp(phone)
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            {isResetMode ? 'Verify Phone to Reset PIN' : 'Enter 6-Digit Verification Code'}
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            We have sent a one-time verification code via SMS to{' '}
            <strong className="text-cocoa dark:text-text-dark-primary font-mono">{phone}</strong>.
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="p-3 rounded-[4px] bg-sky-tint dark:bg-sky/15 border border-sky/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="font-semibold flex items-center gap-1 text-[12px]">
              <KeyRound size={13} className="text-sky" /> Prototype Testing Codes:
            </p>
            <p className="text-[11px]">
              • Valid Success Code: <strong className="font-mono text-sky">{DEMO_OTP}</strong>
            </p>
            <p className="text-[11px]">
              • Expired Code Test: <strong className="font-mono text-coral">{DEMO_EXPIRED_OTP}</strong>
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setOtp(DEMO_OTP)}
              className="text-[10px] px-2 py-0.5 rounded-[2px] bg-sky text-cocoa font-bold hover:bg-sky-hover"
            >
              Fill 123456
            </button>
            <button
              type="button"
              onClick={() => setOtp(DEMO_EXPIRED_OTP)}
              className="text-[10px] px-2 py-0.5 rounded-[2px] bg-slate-200 dark:bg-slate-700 text-cocoa dark:text-white font-medium hover:bg-slate-300"
            >
              Fill 000000
            </button>
          </div>
        </div>

        {/* 6-Box OTP Input */}
        <div className="py-2">
          <OTPInput
            value={otp}
            onChange={(val) => {
              setOtp(val)
              if (errorStatus) {
                setErrorStatus(null)
                setErrorMessage(null)
              }
            }}
            disabled={verifying || errorStatus === 'LOCKED'}
            hasError={errorStatus === 'INVALID' || errorStatus === 'EXPIRED'}
          />
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-[4px] bg-coral-tint/30 border border-coral/30 text-coral text-[11px] flex items-start gap-2">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {errorStatus === 'EXPIRED'
                  ? 'Code Expired'
                  : errorStatus === 'LOCKED'
                  ? 'Too Many Attempts'
                  : 'Invalid OTP Code'}
              </p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Resend Cooldown Counter */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-border dark:border-surface-dark-border text-[11px]">
          <span className="text-text-light-muted dark:text-text-dark-muted font-medium">
            {seconds > 0 ? `Resend available in ${seconds}s` : 'Did not receive code?'}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={seconds > 0 || verifying}
            className="font-semibold text-cocoa dark:text-sky underline decoration-sky disabled:text-text-light-muted dark:disabled:text-text-dark-muted disabled:no-underline flex items-center gap-1"
          >
            <RotateCcw size={12} /> Resend OTP
          </button>
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            disabled={otp.length !== OTP_LENGTH || verifying || errorStatus === 'LOCKED'}
            loading={verifying}
            onClick={handleVerify}
            rightIcon={<ArrowRight size={15} />}
          >
            Verify and Proceed
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={2}
        totalSteps={12}
        stepTitle="OTP Verification"
        backPath="/customer/signup"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 2: OTP Verification"
          subtitle="Confirm your identity with the 6-digit security code"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="otp" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
