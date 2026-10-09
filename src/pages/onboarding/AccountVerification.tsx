// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 11: NCBA Core Account Verification (65/35 Layout)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import { isValidNcbaAccount, formatNcbaAccount } from '../../lib/validators'
import { t24Service, type T24AccountVerifyStatus } from '../../services/t24'

export default function AccountVerification() {
  const navigate = useNavigate()
  const { state, setAccountVerification } = useOnboarding()

  const [accountNumber, setAccountNumber] = useState(
    state.accountNumber || '1023 445 566'
  )
  const [status, setStatus] = useState<T24AccountVerifyStatus | 'IDLE' | 'VERIFYING'>(
    state.accountVerifyStatus !== 'IDLE' ? state.accountVerifyStatus : 'IDLE'
  )
  const [accountName, setAccountName] = useState(state.verifiedAccountName || '')
  const [branch, setBranch] = useState(state.verifiedBranch || '')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  async function handleVerify(accToVerify?: string) {
    const acc = accToVerify || accountNumber
    const clean = acc.replace(/\s/g, '').trim()

    if (!isValidNcbaAccount(clean)) {
      setErrorMessage('Account number must be exactly 10 numeric digits.')
      setStatus('NOT_FOUND')
      return
    }

    setIsVerifying(true)
    setErrorMessage(null)

    const res = await t24Service.verifyAccount(clean, state.nationalId)
    setIsVerifying(false)
    setStatus(res.status)

    if (res.status === 'SUCCESS') {
      const name = res.accountName || state.businessName || 'Bonface Macharia'
      const br = res.branch || 'Commercial Center Branch'
      setAccountName(name)
      setBranch(br)
      setAccountVerification(clean, 'SUCCESS', name, br)
    } else {
      setErrorMessage(res.message)
      setAccountVerification(clean, res.status)
    }
  }

  function handleDemoSelect(acc: string) {
    setAccountNumber(acc)
    setStatus('IDLE')
    setErrorMessage(null)
    handleVerify(acc)
  }

  function handleContinue() {
    if (status !== 'SUCCESS') return
    navigate('/customer/select-anchors')
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            NCBA Settlement Account Verification
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Link your active 10-digit NCBA core banking account for automatic loan disbursements and scheduled settlements.
          </p>
        </div>

        {/* Demo Fast-Test Selectors */}
        <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border">
          <p className="text-[10px] font-semibold text-text-light-secondary dark:text-text-dark-secondary mb-1.5 uppercase tracking-wider">
            Test Outcome Presets (Strict 10-Digit Checking):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('1023445566')}
              className="text-[11px] p-2 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border text-cocoa dark:text-text-dark-primary font-medium hover:border-mediterranean text-left"
            >
              <span className="block font-bold text-mediterranean">1. Success</span>
              <span className="font-mono text-[10px]">1023445566</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('1011111111')}
              className="text-[11px] p-2 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border text-cocoa dark:text-text-dark-primary font-medium hover:border-coral text-left"
            >
              <span className="block font-bold text-coral">2. Not Found</span>
              <span className="font-mono text-[10px]">1011111111</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('1099999999')}
              className="text-[11px] p-2 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border text-cocoa dark:text-text-dark-primary font-medium hover:border-coral text-left"
            >
              <span className="block font-bold text-coral">3. Mismatch</span>
              <span className="font-mono text-[10px]">1099999999</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('1000000000')}
              className="text-[11px] p-2 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border text-cocoa dark:text-text-dark-primary font-medium hover:border-sun-dark text-left"
            >
              <span className="block font-bold text-sun-dark">4. Unavailable</span>
              <span className="font-mono text-[10px]">1000000000</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="NCBA 10-Digit Account Number"
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
              setStatus('IDLE')
              setErrorMessage(null)
            }}
            prefixAddon={<CreditCard size={15} />}
            placeholder="1023 445 566"
            helperText="10 numeric digits. Must belong to the applicant or registered business."
            autoFocus
          />

          <Button
            full
            size="md"
            variant="secondary"
            loading={isVerifying}
            disabled={accountNumber.replace(/\s/g, '').length !== 10 || isVerifying}
            onClick={() => handleVerify()}
          >
            {isVerifying ? 'Verifying with Core Banking…' : 'Validate Account Number'}
          </Button>
        </div>

        {/* Status Feedback Display */}
        {status === 'SUCCESS' && (
          <div className="p-4 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={18} className="text-mediterranean shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[20px] bg-mediterranean-tint text-cocoa border border-mediterranean/40">
                  Verified Active
                </span>
                <h4 className="text-[14px] font-bold text-cocoa dark:text-text-dark-primary mt-1">
                  NCBA Account Verified & Linked
                </h4>
                <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                  Account Name: <strong>{accountName}</strong>
                </p>
                <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                  Account: {formatNcbaAccount(accountNumber)} | Branch: {branch}
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'NOT_FOUND' && (
          <div className="p-3.5 rounded-[4px] bg-coral-tint/30 border border-coral/30 text-coral text-[11px] flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[12px]">Account Number Not Found</p>
              <p className="mt-0.5">
                {errorMessage ||
                  'The 10-digit account number could not be found in NCBA T24 records. Please check the digits and try again.'}
              </p>
            </div>
          </div>
        )}

        {status === 'MISMATCH' && (
          <div className="p-3.5 rounded-[4px] bg-coral-tint/30 border border-coral/30 text-coral text-[11px] flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[12px]">Account Ownership Mismatch</p>
              <p className="mt-0.5">
                {errorMessage ||
                  'This account is registered to a different customer and cannot be used for this facility.'}
              </p>
            </div>
          </div>
        )}

        {status === 'UNAVAILABLE' && (
          <div className="p-3.5 rounded-[4px] bg-sun/20 border border-sun/40 text-cocoa text-[11px] flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 text-sun-dark mt-0.5" />
            <div>
              <p className="font-semibold text-[12px]">Core Banking Gateway Unavailable</p>
              <p className="mt-0.5">
                {errorMessage ||
                  'T24 verification service is temporarily down for maintenance. Please try again in a few moments.'}
              </p>
              <button
                type="button"
                onClick={() => handleVerify()}
                className="mt-2 text-sky font-semibold underline text-[11px]"
              >
                Retry Account Verification
              </button>
            </div>
          </div>
        )}

        {/* Progression Action (STRICTLY BLOCKS PROGRESS UNTIL VERIFIED!) */}
        <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border">
          <Button
            full
            size="md"
            disabled={status !== 'SUCCESS'}
            onClick={handleContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            {status === 'SUCCESS'
              ? 'Continue to Anchor Selection'
              : 'Account Verification Required to Proceed'}
          </Button>

          {status !== 'SUCCESS' && (
            <p className="text-[10px] text-center text-text-light-muted dark:text-text-dark-muted mt-2">
              ⚠️ In accordance with banking regulations, facility setup is blocked until a valid NCBA account is verified.
            </p>
          )}
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={11}
        totalSteps={12}
        stepTitle="Account Verification"
        backPath="/customer/mandate"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 11: NCBA Core Account Verification"
          subtitle="Mandatory 10-digit settlement account verification (blocks progress until verified)"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="account" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
