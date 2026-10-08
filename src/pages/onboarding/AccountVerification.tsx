import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Stepper } from '../../components/ui/Stepper'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'

type Outcome = 'idle' | 'checking' | 'success' | 'not_found' | 'mismatch' | 'unavailable'

export default function AccountVerification() {
  const navigate = useNavigate()
  const [account, setAccount] = useState('')
  const [outcome, setOutcome] = useState<Outcome>('idle')

  function verify() {
    setOutcome('checking')
    setTimeout(() => {
      if (account.replace(/\s/g, '').includes('4455') || account.trim() === '') {
        setOutcome('success')
      } else if (account.trim() === '0000') {
        setOutcome('unavailable')
      } else if (account.trim().length < 6) {
        setOutcome('not_found')
      } else {
        setOutcome('mismatch')
      }
    }, 1300)
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary px-4 py-8 flex flex-col justify-center transition-colors">
      <div className="max-w-md mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={5} />
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">Core Banking Link</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Verify NCBA Account
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Enter your active NCBA account number so we can link your facility to your core banking profile.
          </p>
        </div>

        <Card className="p-5">
          {outcome !== 'success' && (
            <div className="space-y-4">
              <Input
                label="NCBA Account Number"
                value={account}
                onChange={(e) => { setAccount(e.target.value); setOutcome('idle') }}
                placeholder="1023 4455 667"
                helperText="10-digit NCBA core banking account number."
              />
            </div>
          )}

          {outcome === 'idle' && (
            <div className="mt-4">
              <Button full onClick={verify}>Verify account</Button>
            </div>
          )}

          {outcome === 'checking' && (
            <div className="flex flex-col items-center py-6 text-text-light-secondary dark:text-text-dark-secondary">
              <Loader2 className="animate-spin mb-2.5 text-sky" size={24} />
              <p className="text-[12px] font-medium">Validating account against NCBA T24 Core…</p>
            </div>
          )}

          {outcome === 'success' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-[20px] bg-mediterranean/10 border border-mediterranean/30 text-mediterranean flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-bold text-[14px] text-cocoa dark:text-text-dark-primary">
                NCBA Account Verified & Linked
              </p>
              <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-1 mb-5">
                Account 1023 4455 667 (Macharia General Traders) is active.
              </p>
              <Button full onClick={() => navigate('/customer/select-anchors')}>
                Continue to Select Anchors
              </Button>
            </div>
          )}

          {outcome === 'not_found' && (
            <div className="mt-4 space-y-4">
              <ErrorAlert
                title="Account Not Found"
                detail="We could not find this account in T24. Please check the account number and try again."
              />
              <Button full variant="secondary" onClick={() => setOutcome('idle')}>
                Try again
              </Button>
            </div>
          )}

          {outcome === 'mismatch' && (
            <div className="mt-4 space-y-4">
              <ErrorAlert
                title="Details Do Not Match"
                detail="The National ID linked to this account does not match the credentials supplied."
              />
              <Button full variant="secondary" onClick={() => setOutcome('idle')}>
                Try again
              </Button>
            </div>
          )}

          {outcome === 'unavailable' && (
            <div className="mt-4 space-y-4">
              <ErrorAlert
                title="Service Temporarily Unavailable"
                detail="T24 core banking lookup timed out. Please try again in a few moments."
              />
              <Button full variant="secondary" onClick={() => setOutcome('idle')}>
                Retry lookup
              </Button>
            </div>
          )}

          {outcome === 'idle' && (
            <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-4 flex items-start gap-1.5 bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-sun" />
              Prototype tip: any account number containing "4455" (or leaving blank) verifies successfully.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
