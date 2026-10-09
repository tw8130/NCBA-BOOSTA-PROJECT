// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 4: Identity Lookup & T24 Core Banking Branch
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard,
  Building2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import { isValidNationalId } from '../../lib/validators'
import { t24Service, type T24LookupResult } from '../../services/t24'

export default function Identity() {
  const navigate = useNavigate()
  const { state, setIdentityResult } = useOnboarding()

  const [nationalId, setNationalId] = useState(state.nationalId || '24567891')
  const [optionalAccount, setOptionalAccount] = useState('')
  const [hasExistingAccount, setHasExistingAccount] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [lookupResult, setLookupResult] = useState<T24LookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleLookup() {
    if (!isValidNationalId(nationalId)) {
      setError('National ID must be 7 to 8 numeric digits.')
      return
    }

    setError(null)
    setIsSearching(true)
    setLookupResult(null)

    const res = await t24Service.lookupIdentity(
      state.phone,
      nationalId,
      hasExistingAccount ? optionalAccount : undefined
    )

    setIsSearching(false)
    setLookupResult(res)

    if (res.status === 'EXISTING_CUSTOMER' && res.customer) {
      setIdentityResult('EXISTING_CUSTOMER', res.customer, false, nationalId)
    } else if (res.status === 'NEW_TO_BANK') {
      setIdentityResult('NEW_TO_BANK', null, true, nationalId)
    }
  }

  function handleDemoSelect(id: string, phoneNum?: string) {
    setNationalId(id)
    setError(null)
    setLookupResult(null)
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            Identity & Core Banking Match
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            We will verify your National ID against NCBA Core Banking (T24) to retrieve existing records or initiate an account setup.
          </p>
        </div>

        {/* Demo Test Scenarios Chip Bar */}
        <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-800/60 border border-surface-border dark:border-surface-dark-border">
          <p className="text-[10px] font-semibold text-text-light-secondary dark:text-text-dark-secondary mb-1.5 uppercase tracking-wider">
            Test Whitelist Profiles:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('24567891')}
              className={`text-[11px] px-2 py-1 rounded-[4px] border font-medium transition-colors ${
                nationalId === '24567891'
                  ? 'bg-sky text-cocoa font-bold border-sky'
                  : 'bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white border-surface-border hover:border-sky'
              }`}
            >
              Existing Customer (24567891 — Bonface Macharia)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('30123456')}
              className={`text-[11px] px-2 py-1 rounded-[4px] border font-medium transition-colors ${
                nationalId === '30123456'
                  ? 'bg-sky text-cocoa font-bold border-sky'
                  : 'bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white border-surface-border hover:border-sky'
              }`}
            >
              New-To-Bank / NTB (30123456 — Alex Mutua)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('00000000')}
              className="text-[11px] px-2 py-1 rounded-[4px] border border-surface-border bg-white dark:bg-surface-dark-paper text-coral font-medium hover:border-coral"
            >
              System Unavailable (00000000)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Kenyan National ID Number"
            value={nationalId}
            onChange={(e) => {
              setNationalId(e.target.value.replace(/\D/g, '').slice(0, 8))
              if (error) setError(null)
            }}
            prefixAddon={<CreditCard size={15} />}
            placeholder="e.g. 24567891"
            error={error || undefined}
            helperText="Must match the National ID provided on your distributor trade permit."
            autoFocus
          />

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[12px] text-cocoa dark:text-text-dark-primary font-medium">
              <input
                type="checkbox"
                checked={hasExistingAccount}
                onChange={(e) => setHasExistingAccount(e.target.checked)}
                className="w-4 h-4 rounded border-surface-border text-sky focus:ring-sky"
              />
              <span>I have an existing NCBA account number</span>
            </label>

            {hasExistingAccount && (
              <div className="mt-2.5">
                <Input
                  label="NCBA Account Number (Optional lookup hint)"
                  value={optionalAccount}
                  onChange={(e) => setOptionalAccount(e.target.value)}
                  placeholder="1023 445 566"
                  helperText="10-digit NCBA core banking account number."
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            loading={isSearching}
            disabled={nationalId.length < 7 || isSearching}
            onClick={handleLookup}
            leftIcon={<Search size={15} />}
          >
            {isSearching ? 'Querying NCBA T24 Core Banking…' : 'Check NCBA Eligibility'}
          </Button>
        </div>

        {/* Dynamic Result Card */}
        {lookupResult && (
          <div className="pt-2">
            {lookupResult.status === 'EXISTING_CUSTOMER' && lookupResult.customer && (
              <div className="p-4 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-mediterranean shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[20px] bg-sky-tint text-cocoa border border-sky/30">
                      From NCBA T24
                    </span>
                    <h4 className="text-[14px] font-bold text-cocoa dark:text-text-dark-primary mt-1">
                      Existing NCBA Customer Verified
                    </h4>
                    <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                      Customer CIF: <strong className="font-mono">{lookupResult.customer.cif}</strong> —{' '}
                      {lookupResult.customer.fullName}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-[4px] bg-white dark:bg-surface-dark-paper border border-surface-border dark:border-surface-dark-border text-[11px] space-y-1">
                  <p className="text-text-light-secondary dark:text-text-dark-secondary">
                    Primary Account: <strong>{lookupResult.customer.accounts[0]?.number}</strong> ({lookupResult.customer.accounts[0]?.type})
                  </p>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary">
                    Registered Branch: <strong>{lookupResult.customer.accounts[0]?.branch}</strong>
                  </p>
                </div>

                <Button
                  full
                  size="md"
                  onClick={() => navigate('/customer/profile')}
                  rightIcon={<ArrowRight size={15} />}
                >
                  Proceed with Prefilled T24 Profile
                </Button>
              </div>
            )}

            {lookupResult.status === 'NEW_TO_BANK' && (
              <div className="p-4 rounded-[4px] bg-sun/15 border border-sun/40 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={18} className="text-sun-dark shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[20px] bg-sun text-cocoa font-bold">
                      New-to-Bank Pre-Approved
                    </span>
                    <h4 className="text-[13px] font-bold text-cocoa dark:text-text-dark-primary mt-1 leading-snug">
                      {lookupResult.ntbBannerText ||
                        'You do not have an active NCBA Account. To activate your KES 5M facility, open an account via NCBA NOW in 3 minutes.'}
                    </h4>
                    <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                      Your business has been qualified through your anchor supplier relationship. Complete a fast 3-minute digital account opening via NCBA NOW.
                    </p>
                  </div>
                </div>

                <Button
                  full
                  size="md"
                  variant="accent"
                  onClick={() => navigate('/customer/ncba-now')}
                  rightIcon={<ExternalLink size={15} />}
                >
                  Open NCBA NOW Account (3 Mins)
                </Button>
              </div>
            )}

            {lookupResult.status === 'DETAILS_MISMATCH' && (
              <div className="p-3.5 rounded-[4px] bg-coral-tint/30 border border-coral/30 text-coral text-[11px] flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[12px]">Phone & National ID Mismatch</p>
                  <p className="mt-0.5">{lookupResult.message}</p>
                </div>
              </div>
            )}

            {lookupResult.status === 'NOT_INVITED' && (
              <div className="p-3.5 rounded-[4px] bg-coral-tint/30 border border-coral/30 text-coral text-[11px] flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[12px]">Pre-Approval Whitelist Record Not Found</p>
                  <p className="mt-0.5">{lookupResult.message}</p>
                </div>
              </div>
            )}

            {lookupResult.status === 'UNAVAILABLE' && (
              <div className="p-3.5 rounded-[4px] bg-sun/20 border border-sun/40 text-cocoa text-[11px] flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 text-sun-dark mt-0.5" />
                <div>
                  <p className="font-semibold text-[12px]">T24 Gateway Temporarily Unavailable</p>
                  <p className="mt-0.5">{lookupResult.message}</p>
                  <button
                    type="button"
                    onClick={handleLookup}
                    className="mt-2 text-sky font-semibold underline text-[11px]"
                  >
                    Retry Core Banking Lookup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={4}
        totalSteps={12}
        stepTitle="Identity Lookup"
        backPath="/customer/create-pin"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 4: Identity Verification & T24 Match"
          subtitle="Determine core banking status for prefilling or instant account creation"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="identity" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
