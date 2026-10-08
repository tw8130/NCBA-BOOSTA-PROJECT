import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Stepper } from '../../components/ui/Stepper'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'

const MIN_LENGTH = 4

export default function CreatePin() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [reveal, setReveal] = useState(false)
  const tooShort = pin.length > 0 && pin.length < MIN_LENGTH
  const mismatch = confirm.length === MIN_LENGTH && pin !== confirm

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary px-4 py-8 flex flex-col justify-center transition-colors">
      <div className="max-w-sm mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={1} />
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">Security</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Create Your BOOSTA PIN
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            You will use this {MIN_LENGTH}-digit PIN to sign in and authorize drawdown actions.
          </p>
        </div>

        <Card className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
              New 4-digit PIN
            </label>
            <div className="relative">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, MIN_LENGTH))}
                type={reveal ? 'text' : 'password'}
                inputMode="numeric"
                className="w-full h-[38px] px-3 pr-10 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary text-base tracking-[0.5em] text-center focus:outline-none focus:border-sky"
                placeholder="••••"
              />
              <button
                onClick={() => setReveal((r) => !r)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light-muted dark:text-text-dark-muted"
                type="button"
                aria-label={reveal ? 'Hide PIN' : 'Reveal PIN'}
              >
                {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {tooShort && <p className="text-[11px] text-coral mt-1 font-medium">PIN must be {MIN_LENGTH} digits.</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
              Confirm 4-digit PIN
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, MIN_LENGTH))}
              type={reveal ? 'text' : 'password'}
              inputMode="numeric"
              className="w-full h-[38px] px-3 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary text-base tracking-[0.5em] text-center focus:outline-none focus:border-sky"
              placeholder="••••"
            />
            {mismatch && <p className="text-[11px] text-coral mt-1 font-medium">PINs do not match — please re-enter.</p>}
          </div>

          <Button
            full
            disabled={pin.length < MIN_LENGTH || confirm.length < MIN_LENGTH || mismatch}
            onClick={() => navigate('/customer/profile')}
          >
            Set PIN and continue
          </Button>
        </Card>
      </div>
    </div>
  )
}
