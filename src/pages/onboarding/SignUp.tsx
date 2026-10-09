// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 1: Mobile Activation (65/35 Layout)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import { isValidKenyanPhone, formatKenyanPhone } from '../../lib/validators'

export default function SignUp() {
  const navigate = useNavigate()
  const { state, setPhone: savePhone } = useOnboarding()

  const [phone, setPhone] = useState(state.phone || '0712 345 678')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleContinue() {
    if (!isValidKenyanPhone(phone)) {
      setError('Please enter a valid Kenyan mobile number (07XX XXX XXX or 01XX XXX XXX)')
      return
    }

    setError(null)
    setLoading(true)

    savePhone(formatKenyanPhone(phone))
    setTimeout(() => {
      setLoading(false)
      navigate('/customer/otp')
    }, 300)
  }

  function fillDemoNumber(num: string) {
    setPhone(num)
    setError(null)
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            Verify Mobile Number
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Enter the registered mobile number that received your pre-approved NCBA BOOSTA invitation SMS.
          </p>
        </div>

        <Input
          label="Safaricom / Airtel Mobile Number"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            if (error) setError(null)
          }}
          prefixAddon={<Phone size={15} />}
          placeholder="0712 345 678"
          error={error || undefined}
          helperText="A 6-digit one-time verification code (OTP) will be sent via SMS."
          autoFocus
        />

        {/* Quick Demo Pre-fill Chips */}
        <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border">
          <p className="text-[10px] font-semibold text-text-light-secondary dark:text-text-dark-secondary mb-1.5 uppercase tracking-wider">
            Quick Test Demo Whitelist:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemoNumber('0712 345 678')}
              className="text-[11px] px-2 py-1 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border text-cocoa dark:text-text-dark-primary font-medium hover:border-sky"
            >
              0712 345 678 (Existing Customer — Bonface)
            </button>
            <button
              type="button"
              onClick={() => fillDemoNumber('0733 123 456')}
              className="text-[11px] px-2 py-1 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border text-cocoa dark:text-text-dark-primary font-medium hover:border-sky"
            >
              0733 123 456 (New-To-Bank Applicant)
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            loading={loading}
            onClick={handleContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            Send Verification Code
          </Button>
        </div>

        <div className="p-3 rounded-[4px] bg-sky-tint dark:bg-sky/10 border border-sky/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
          <ShieldCheck size={15} className="text-sky shrink-0 mt-0.5" />
          <p>
            NCBA BOOSTA uses bank-grade 256-bit encryption. Your mobile number will be matched against NCBA core banking records.
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader currentStep={1} totalSteps={12} stepTitle="Mobile Activation" backPath="/" />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 1: Mobile Activation"
          subtitle="Confirm your pre-approved invitation credentials"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="mobile" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
