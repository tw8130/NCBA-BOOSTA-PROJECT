// -----------------------------------------------------------------------------
// NCBA BOOSTA — NCBA NOW Redirect & Account Opening Gateway
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Smartphone,
  CheckCircle2,
  Building2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { useOnboarding } from '../../context/OnboardingContext'
import { onboardingApi } from '../../services/onboardingApi'

export default function NcbaNow() {
  const navigate = useNavigate()
  const { state, setNcbaNowSuccess } = useOnboarding()

  const [accountType, setAccountType] = useState('Business Current Account')
  const [stage, setStage] = useState<'SELECT' | 'PROVISIONING' | 'SUCCESS'>('SELECT')
  const [createdAccount, setCreatedAccount] = useState<{
    accountNumber: string
    cif: string
    accountName: string
    branch: string
  } | null>(null)

  async function handleOpenAccount() {
    setStage('PROVISIONING')

    const res = await onboardingApi.openNcbaNowAccount({
      fullName: state.fullName || 'Alex Mutua Musyoka',
      nationalId: state.nationalId || '30123456',
      phone: state.phone,
      businessName: state.businessName,
    })

    setCreatedAccount(res)
    setStage('SUCCESS')
    setNcbaNowSuccess(res.accountNumber, res.cif)
  }

  function handleReturnToBoosta() {
    navigate('/customer/profile')
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader stepTitle="NCBA NOW Gateway" backPath="/customer/identity" />

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] bg-sun text-cocoa text-[11px] font-bold mb-2">
            <Smartphone size={13} /> NCBA NOW Digital Gateway
          </div>
          <h1 className="text-[22px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            Instant Account Creation
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-1 max-w-md mx-auto">
            Open your dedicated NCBA commercial settlement account in 3 minutes to activate your KES 5,000,000 BOOSTA credit line.
          </p>
        </div>

        <Card className="p-6">
          {stage === 'SELECT' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-[4px] bg-sky-tint dark:bg-sky/15 border border-sky/30 text-[12px] text-cocoa dark:text-text-dark-primary flex items-start gap-2.5">
                <Sparkles size={16} className="text-sky shrink-0 mt-0.5" />
                <p>
                  As an approved distributor, your account requires zero opening balance and is instantly linked to your BOOSTA facility upon creation.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-[12px] font-semibold text-cocoa dark:text-text-dark-primary">
                  Select Commercial Account Type:
                </label>

                {[
                  {
                    title: 'Business Current Account (Recommended)',
                    desc: 'Designed for high-turnover retailers and distributors. Includes mobile cheque clearing and free incoming RTGS/EFT.',
                    fee: 'Zero ledger fee with active BOOSTA facility',
                  },
                  {
                    title: 'SME Commercial Growth Account',
                    desc: 'Tiered interest earning settlement account with integrated M-Pesa Till number sweeping.',
                    fee: 'KES 500 monthly fee waived for 12 months',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setAccountType(item.title)}
                    className={`p-3.5 rounded-[4px] border cursor-pointer transition-all ${
                      accountType === item.title
                        ? 'border-sky bg-sky-tint/30 dark:bg-sky/10 ring-1 ring-sky/40'
                        : 'border-surface-border dark:border-surface-dark-border hover:border-sky/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold text-cocoa dark:text-text-dark-primary">
                        {item.title}
                      </p>
                      <input
                        type="radio"
                        checked={accountType === item.title}
                        onChange={() => setAccountType(item.title)}
                        className="text-sky focus:ring-sky"
                      />
                    </div>
                    <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-1">
                      {item.desc}
                    </p>
                    <p className="text-[10px] text-mediterranean dark:text-teal-400 font-medium mt-1">
                      ✓ {item.fee}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  full
                  size="lg"
                  onClick={handleOpenAccount}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Create Account via NCBA NOW
                </Button>
              </div>
            </div>
          )}

          {stage === 'PROVISIONING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-sky-tint dark:bg-sky/20 border border-sky/30 flex items-center justify-center text-sky animate-spin">
                <Loader2 size={26} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary">
                  Opening Your NCBA Commercial Account…
                </h3>
                <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-1">
                  Connecting to NCBA T24 Core Banking and generating your 10-digit IBAN/Account details.
                </p>
              </div>
              <div className="w-48 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-sky animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {stage === 'SUCCESS' && createdAccount && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-mediterranean/15 text-mediterranean flex items-center justify-center mx-auto mb-2 border border-mediterranean/30">
                  <CheckCircle2 size={26} />
                </div>
                <h3 className="text-[18px] font-bold text-cocoa dark:text-text-dark-primary">
                  NCBA Account Created Successfully!
                </h3>
                <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                  Your new commercial account is active and linked to your BOOSTA credit facility.
                </p>
              </div>

              {/* Account Card Details */}
              <div className="p-4 rounded-[4px] bg-cocoa text-white space-y-3">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={16} className="text-sky" />
                    <span className="text-[12px] font-bold">NCBA Bank Kenya PLC</span>
                  </div>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-[20px] bg-sky text-cocoa font-bold">
                    Active
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-sky uppercase tracking-wider font-semibold">
                    10-Digit Account Number
                  </p>
                  <p className="text-[20px] font-mono font-bold tracking-wider text-white">
                    {createdAccount.accountNumber}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                  <div>
                    <span className="text-white/60 text-[10px]">CIF Identifier</span>
                    <p className="font-mono">{createdAccount.cif}</p>
                  </div>
                  <div>
                    <span className="text-white/60 text-[10px]">Branch</span>
                    <p>{createdAccount.branch}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
                <ShieldCheck size={16} className="text-mediterranean shrink-0 mt-0.5" />
                <p>
                  This account has been pre-configured as your primary settlement account for both disbursements and repayments.
                </p>
              </div>

              <Button
                full
                size="lg"
                onClick={handleReturnToBoosta}
                rightIcon={<ArrowRight size={16} />}
              >
                Return to BOOSTA & Continue Setup
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
