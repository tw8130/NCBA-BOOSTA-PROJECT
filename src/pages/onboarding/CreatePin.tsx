// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 3: Security PIN Creation (65/35 Layout)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PinField } from '../../components/domain/PinField'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import { DEMO_PIN, isWeakPin, PIN_LENGTH } from '../../lib/validators'

export default function CreatePin() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isResetMode = searchParams.get('purpose') === 'reset'

  const { setPinCreated } = useOnboarding()

  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleSetPin() {
    // 1. Length check
    if (pin.length !== PIN_LENGTH) {
      setPinError(`PIN must be exactly ${PIN_LENGTH} digits`)
      return
    }

    // 2. Weak PIN check
    const weakCheck = isWeakPin(pin)
    if (weakCheck.isWeak) {
      setPinError(weakCheck.reason || 'PIN is too simple')
      return
    }

    // 3. Match check
    if (pin !== confirmPin) {
      setConfirmError('PIN and confirmation PIN do not match')
      return
    }

    setPinError(null)
    setConfirmError(null)
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setPinCreated(true)

      if (isResetMode) {
        navigate('/customer/login')
      } else {
        // Proceed to Identity Lookup
        navigate('/customer/identity')
      }
    }, 400)
  }

  function fillDemoPin() {
    setPin(DEMO_PIN)
    setConfirmPin(DEMO_PIN)
    setPinError(null)
    setConfirmError(null)
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            {isResetMode ? 'Reset Your BOOSTA PIN' : 'Create 4-Digit Security PIN'}
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Your {PIN_LENGTH}-digit PIN is required to log in and authorize drawdown orders.
          </p>
        </div>

        {/* Demo Pin Chip */}
        <div className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary">
            <KeyRound size={13} className="text-sky" /> Fast test setup:
          </span>
          <button
            type="button"
            onClick={fillDemoPin}
            className="text-[11px] font-semibold text-cocoa dark:text-sky underline decoration-sky hover:text-sky-dark"
          >
            Use Demo PIN ({DEMO_PIN})
          </button>
        </div>

        <div className="space-y-4">
          <PinField
            label={`New ${PIN_LENGTH}-Digit PIN`}
            value={pin}
            onChange={(v) => {
              setPin(v)
              if (pinError) setPinError(null)
            }}
            error={pinError || undefined}
            autoFocus
          />

          <PinField
            label={`Confirm ${PIN_LENGTH}-Digit PIN`}
            value={confirmPin}
            onChange={(v) => {
              setConfirmPin(v)
              if (confirmError) setConfirmError(null)
            }}
            error={confirmError || undefined}
          />
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            disabled={
              pin.length !== PIN_LENGTH ||
              confirmPin.length !== PIN_LENGTH ||
              isLoading
            }
            loading={isLoading}
            onClick={handleSetPin}
            rightIcon={<ArrowRight size={15} />}
          >
            {isResetMode ? 'Update PIN and Return to Login' : 'Save PIN & Continue to Identity'}
          </Button>
        </div>

        <div className="p-3 rounded-[4px] bg-sky-tint dark:bg-sky/10 border border-sky/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
          <ShieldCheck size={15} className="text-sky shrink-0 mt-0.5" />
          <p>
            Do not use sequential numbers (e.g. 1234) or repeating numbers (e.g. 1111). NCBA Bank will never ask for your PIN over phone or SMS.
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={3}
        totalSteps={12}
        stepTitle="Security PIN"
        backPath="/customer/otp"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 3: Security PIN"
          subtitle="Set your confidential 4-digit transaction and authentication PIN"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="pin" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
