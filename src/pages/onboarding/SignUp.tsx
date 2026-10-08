import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Stepper } from '../../components/ui/Stepper'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'

export default function SignUp() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-10 bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors">
      <div className="max-w-sm mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={0} />
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">Step 1 of 7</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Activate Your Facility
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Confirm your registered mobile number to verify your pre-approved limit.
          </p>
        </div>

        <Card className="p-5 space-y-4">
          <Input
            label="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            helperText="Enter the phone number that received the NCBA invitation SMS."
          />
          <Button
            full
            disabled={phone.length < 9}
            onClick={() => navigate('/customer/otp', { state: { phone } })}
          >
            Continue
          </Button>
        </Card>

        <p className="text-center text-[12px] text-text-light-muted dark:text-text-dark-muted mt-6">
          Already registered?{' '}
          <button
            className="text-cocoa dark:text-sky font-bold underline decoration-sky"
            onClick={() => navigate('/customer/login')}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
