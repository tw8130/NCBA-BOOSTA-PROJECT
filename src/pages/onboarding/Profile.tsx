import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Stepper } from '../../components/ui/Stepper'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'
import { mockCustomer } from '../../mocks/data'

function Field({
  label,
  prefilled,
  ...rest
}: {
  label: string
  prefilled?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary">
          {label}
        </label>
        {prefilled && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-mediterranean dark:text-teal-400 bg-mediterranean/10 border border-mediterranean/20 px-1.5 py-0.5 rounded-[20px]">
            <CheckCircle2 size={10} /> From NCBA T24
          </span>
        )}
      </div>
      <input
        {...rest}
        className={`w-full h-[38px] px-3 rounded-[4px] border text-[13px] text-cocoa dark:text-text-dark-primary focus:outline-none focus:border-sky transition-colors ${
          prefilled
            ? 'border-mediterranean/30 bg-mediterranean/5 text-text-light-secondary dark:text-text-dark-secondary cursor-not-allowed'
            : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper'
        }`}
      />
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const p = mockCustomer.prefilledFields

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary px-4 py-8 transition-colors flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={2} />
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">Personal KYB</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Borrower Profile
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            We've pre-filled details verified from your NCBA core profile. Please complete the rest.
          </p>
        </div>

        <Card className="p-5">
          <Field label="Full names" defaultValue="Bonface Macharia" prefilled={p.includes('fullName')} disabled={p.includes('fullName')} />
          <Field label="National ID" defaultValue="24567891" prefilled={p.includes('nationalId')} disabled={p.includes('nationalId')} />
          <Field label="Date of birth" type="date" defaultValue="1990-05-14" prefilled={p.includes('dateOfBirth')} disabled={p.includes('dateOfBirth')} />
          <Field label="Mobile number" defaultValue="0712 345 678" prefilled={p.includes('phone')} disabled={p.includes('phone')} />
          <Field label="Email address" type="email" placeholder="you@example.com" />
          <Field label="Physical business premises" placeholder="Street, building, trading center" />
          <Field label="County" placeholder="e.g. Nairobi" />

          <Button full className="mt-4" onClick={() => navigate('/customer/kyc')}>
            Save and continue
          </Button>
        </Card>
      </div>
    </div>
  )
}
