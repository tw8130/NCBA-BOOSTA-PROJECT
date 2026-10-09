// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 12: Select Anchors from Backend List (65/35 Layout)
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users2,
  Check,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useAuth } from '../../context/AuthContext'
import { useOnboarding } from '../../context/OnboardingContext'
import { useApp } from '../../context/AppContext'
import { onboardingApi, type EligibleAnchor } from '../../services/onboardingApi'
import { api } from '../../services/api'
import { formatKES } from '../../lib/format'

export default function SelectAnchor() {
  const navigate = useNavigate()
  const { signInAs } = useAuth()
  const { refresh } = useApp()
  const { state } = useOnboarding()

  const [anchors, setAnchors] = useState<EligibleAnchor[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchAnchors() {
      setIsLoading(true)
      const list = await onboardingApi.getEligibleAnchors()
      setAnchors(list)
      setSelectedIds(list.map((a) => a.id)) // Default: select all
      setIsLoading(false)
    }
    fetchAnchors()
  }, [])

  function toggleAnchor(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  function handleSelectAll() {
    setSelectedIds(anchors.map((a) => a.id))
  }

  function handleDeselectAll() {
    setSelectedIds([])
  }

  const totalSelectedLimit = anchors
    .filter((a) => selectedIds.includes(a.id))
    .reduce((acc, curr) => acc + curr.indicativeLimit, 0)

  async function handleFinish() {
    setIsSubmitting(true)

    // Complete onboarding in store
    await api.completeOnboarding({
      fullName: state.fullName,
      phone: state.phone,
      email: state.email,
      businessName: state.businessName,
      businessType: state.businessType,
      ncbaAccountNumber: state.accountNumber,
    })

    // Activate customer session
    signInAs('CUSTOMER')
    await refresh()

    setIsSubmitting(false)
    navigate('/customer/dashboard')
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            Eligible Anchor Supply Partners
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            NCBA identified these eligible corporate suppliers based on your historical commercial turnover. Select all you wish to activate.
          </p>
        </div>

        {/* Live Facility Summary Card */}
        <div className="p-3.5 rounded-[4px] bg-cocoa text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] text-sky uppercase tracking-wider font-semibold">
              Total Activated Facility Limit
            </span>
            <p className="text-[20px] font-bold tracking-tight mt-0.5">
              {formatKES(totalSelectedLimit)}
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-[20px] text-sky">
            {selectedIds.length} of {anchors.length} Selected
          </span>
        </div>

        {/* Bulk Selection Actions */}
        <div className="flex items-center justify-between pb-1 border-b border-surface-border dark:border-surface-dark-border text-[11px]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="font-semibold text-cocoa dark:text-sky underline decoration-sky hover:text-sky-dark"
            >
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="font-semibold text-text-light-muted hover:text-cocoa dark:hover:text-white"
            >
              Deselect All
            </button>
          </div>

          <span className="text-[10px] text-text-light-muted">
            Indicative limits based on 12-month distributor records
          </span>
        </div>

        {/* Anchors List */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="py-8 text-center text-[12px] text-text-light-muted">
              Loading backend eligible anchors…
            </div>
          ) : (
            anchors.map((anchor) => {
              const isSelected = selectedIds.includes(anchor.id)
              return (
                <div
                  key={anchor.id}
                  onClick={() => toggleAnchor(anchor.id)}
                  className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-sky bg-sky-tint/30 dark:bg-sky/15 ring-1 ring-sky/50'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper hover:border-sky/30'
                  }`}
                >
                  <div className="w-9 h-9 rounded-[4px] bg-cocoa text-sky font-bold flex items-center justify-center text-[12px] shrink-0 border border-white/10">
                    {anchor.logoInitial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold text-cocoa dark:text-text-dark-primary truncate">
                        {anchor.name}
                      </p>
                      <span className="text-[10px] font-semibold text-sky bg-sky/10 px-1.5 py-0.5 rounded-[2px] ml-2 shrink-0">
                        Up to {anchor.maxTenorDays} Days
                      </span>
                    </div>

                    <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                      {anchor.category} · Approved Working Capital:{' '}
                      <strong className="text-cocoa dark:text-text-dark-primary">
                        {formatKES(anchor.indicativeLimit)}
                      </strong>
                    </p>

                    <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
                      Annual Certified Supplier Turnover: {formatKES(anchor.annualTurnoverKes)}
                    </p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-[3px] border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-sky bg-sky text-cocoa'
                        : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper'
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="pt-2">
          <Button
            full
            size="lg"
            loading={isSubmitting}
            disabled={selectedIds.length === 0 || isSubmitting}
            onClick={handleFinish}
            rightIcon={<ArrowRight size={16} />}
          >
            {isSubmitting
              ? 'Activating Facility & Finalizing Setup…'
              : `Complete Activation & Go to Dashboard (${selectedIds.length} Selected)`}
          </Button>
        </div>

        <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
          <ShieldCheck size={16} className="text-mediterranean shrink-0 mt-0.5" />
          <p>
            Your pre-approved limit is immediately available for drawdown. Loan proceeds will be disbursed directly to selected anchor settlement accounts.
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={12}
        totalSteps={12}
        stepTitle="Select Anchors"
        backPath="/customer/account-verification"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 12: Select Anchor Supply Partners"
          subtitle="Choose certified anchors to allocate your revolving credit facility"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="anchors" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
