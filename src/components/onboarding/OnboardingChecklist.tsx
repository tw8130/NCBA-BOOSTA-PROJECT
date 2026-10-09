// -----------------------------------------------------------------------------
// NCBA BOOSTA — Live 35% Onboarding Checklist & Application Summary
// -----------------------------------------------------------------------------

import { CheckCircle2, Circle, AlertCircle, Building2, MapPin, ShieldCheck, UserCheck, CreditCard } from 'lucide-react'
import { useOnboarding } from '../../context/OnboardingContext'
import { ENTITY_DOCUMENTS } from '../../lib/onboardingDocs'
import { formatKES } from '../../lib/format'

interface OnboardingChecklistProps {
  currentStepId?: string
}

export function OnboardingChecklist({ currentStepId: _currentStepId }: OnboardingChecklistProps) {
  const { state, loadPresetScenario } = useOnboarding()

  const entityDocs = ENTITY_DOCUMENTS[state.businessType] || []

  // Check completions
  const isAuthDone = state.otpVerified && state.pinCreated
  const isIdentityDone = state.t24Status === 'EXISTING_CUSTOMER' || state.ncbaNowCompleted
  const isKycDone =
    state.idFrontStatus === 'VERIFIED' &&
    state.idBackStatus === 'VERIFIED' &&
    state.selfieStatus === 'VERIFIED'
  const isPremisesDone = state.premises !== null
  const requiredDocs = entityDocs.filter((d) => d.required)
  const isDocsDone =
    requiredDocs.length > 0 &&
    requiredDocs.every((d) => state.documents[d.id]?.status === 'VERIFIED')
  const isMandateDone =
    state.applicantSignature !== null &&
    (state.businessType === 'SOLE_PROPRIETOR' || state.signatories.length >= 1)
  const isAccountDone = state.accountVerifyStatus === 'SUCCESS'

  const stages = [
    {
      id: 'auth',
      title: 'Mobile & PIN Setup',
      done: isAuthDone,
      detail: state.phone ? state.phone : 'Pending',
    },
    {
      id: 'identity',
      title: 'NCBA Core T24 Match',
      done: isIdentityDone,
      detail: state.isNewToBank
        ? state.ncbaNowCompleted
          ? 'NCBA NOW Created'
          : 'New-to-Bank'
        : state.t24Customer
        ? 'Existing (T24 Prefilled)'
        : 'Pending Lookup',
    },
    {
      id: 'kyc',
      title: 'KYC & Live Biometrics',
      done: isKycDone,
      detail:
        state.selfieStatus === 'VERIFIED'
          ? 'ID & Selfie Verified'
          : 'ID & Oval Selfie Pending',
    },
    {
      id: 'business',
      title: 'Premises Geotag',
      done: isPremisesDone,
      detail: state.premises
        ? `GPS ±${state.premises.accuracy}m stamped`
        : 'Awaiting Viewfinder GPS',
    },
    {
      id: 'docs',
      title: `${
        state.businessType === 'SOLE_PROPRIETOR'
          ? 'Sole Proprietor'
          : state.businessType === 'PARTNERSHIP'
          ? 'Partnership'
          : 'Limited Co'
      } Documents`,
      done: isDocsDone,
      detail: `${
        requiredDocs.filter((d) => state.documents[d.id]?.status === 'VERIFIED').length
      }/${requiredDocs.length} Verified`,
    },
    {
      id: 'mandate',
      title: 'Signing Mandate',
      done: isMandateDone,
      detail: `${state.mandate.replace('_', ' ')} (${state.signatories.length} ${
        state.businessType === 'SOLE_PROPRIETOR' ? 'Applicant' : 'Signatories'
      })`,
    },
    {
      id: 'account',
      title: 'Disbursement Account',
      done: isAccountDone,
      detail: isAccountDone ? `Verified: ${state.accountNumber}` : 'Account Pending',
    },
  ]

  // Completed count
  const completedCount = stages.filter((s) => s.done).length
  const pct = Math.round((completedCount / stages.length) * 100)

  return (
    <div className="space-y-4">
      {/* Overall Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-semibold text-cocoa dark:text-text-dark-primary">
            Onboarding Completion
          </span>
          <span className="font-mono font-bold text-sky dark:text-sky">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-[2px] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-sky transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Facility Pre-Approved Value */}
      <div className="p-3 rounded-[4px] bg-cocoa text-white">
        <p className="text-[10px] text-sky uppercase tracking-wider font-semibold">
          Pre-Approved Working Capital
        </p>
        <p className="text-[18px] font-bold tracking-tight mt-0.5">
          {formatKES(state.indicativeFacilityLimit)}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/80">
          <ShieldCheck size={12} className="text-sun" />
          <span>Indicative limit based on anchor turnover</span>
        </div>
      </div>

      {/* Stage Checklist */}
      <div className="space-y-2 border-b border-surface-border dark:border-surface-dark-border pb-3">
        <h4 className="text-[11px] font-semibold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
          Verification Checklist
        </h4>
        <div className="space-y-1.5">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-start gap-2 p-1.5 rounded-[4px] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              {stage.done ? (
                <CheckCircle2 size={15} className="text-mediterranean shrink-0 mt-0.5" />
              ) : (
                <Circle size={15} className="text-text-light-muted shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[12px] font-medium leading-tight truncate ${
                    stage.done
                      ? 'text-cocoa dark:text-text-dark-primary'
                      : 'text-text-light-secondary dark:text-text-dark-secondary'
                  }`}
                >
                  {stage.title}
                </p>
                <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted truncate">
                  {stage.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Entity Document Checklist */}
      <div className="space-y-2 border-b border-surface-border dark:border-surface-dark-border pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-cocoa dark:text-text-dark-primary flex items-center gap-1">
            <Building2 size={13} className="text-sky" />
            {state.businessType === 'SOLE_PROPRIETOR'
              ? 'Sole Prop Docs'
              : state.businessType === 'PARTNERSHIP'
              ? 'Partnership Docs'
              : 'Ltd Company Docs'}
          </span>
          <span className="text-[9px] uppercase font-bold text-sky">
            {state.businessType.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-1">
          {entityDocs.map((doc) => {
            const docStatus = state.documents[doc.id]?.status || 'EMPTY'
            const isDocOk = docStatus === 'VERIFIED'
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between text-[11px] py-1 border-b border-surface-border/50 dark:border-surface-dark-border/50 last:border-0"
              >
                <span className="truncate max-w-[170px] text-text-light-secondary dark:text-text-dark-secondary">
                  {doc.label}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-[2px] ${
                    isDocOk
                      ? 'bg-mediterranean/15 text-cocoa dark:text-text-dark-primary'
                      : docStatus === 'FAILED'
                      ? 'bg-coral-tint text-coral'
                      : docStatus === 'VERIFYING' || docStatus === 'UPLOADING'
                      ? 'bg-sun/20 text-cocoa'
                      : 'bg-slate-100 dark:bg-slate-800 text-text-light-muted'
                  }`}
                >
                  {docStatus === 'VERIFIED'
                    ? 'Verified'
                    : docStatus === 'FAILED'
                    ? 'Failed'
                    : docStatus === 'VERIFYING'
                    ? 'Checking'
                    : doc.required
                    ? 'Required'
                    : 'Optional'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Geotag & Identity Snapshot */}
      <div className="space-y-2 border-b border-surface-border dark:border-surface-dark-border pb-3 text-[11px]">
        <h4 className="text-[11px] font-semibold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
          Verified Identifiers
        </h4>

        <div className="space-y-1.5 bg-surface-light dark:bg-surface-dark-bg p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border">
          <div className="flex items-center justify-between">
            <span className="text-text-light-muted flex items-center gap-1">
              <UserCheck size={12} /> Applicant
            </span>
            <span className="font-semibold text-cocoa dark:text-text-dark-primary truncate max-w-[140px]">
              {state.fullName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-light-muted">National ID</span>
            <span className="font-mono text-cocoa dark:text-text-dark-primary">
              {state.nationalId ? `${state.nationalId.slice(0, 3)}****${state.nationalId.slice(-2)}` : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-light-muted flex items-center gap-1">
              <CreditCard size={12} /> NCBA Account
            </span>
            <span className="font-mono text-cocoa dark:text-text-dark-primary">
              {state.accountNumber ? state.accountNumber : '—'}
            </span>
          </div>

          {state.premises && (
            <div className="pt-1.5 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
              <span className="text-text-light-muted flex items-center gap-1">
                <MapPin size={12} className="text-sky" /> Premises GPS
              </span>
              <span className="font-mono text-[10px] text-cocoa dark:text-text-dark-primary">
                {state.premises.latitude}°, {state.premises.longitude}°
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Checkpoint Quick Scenario Switcher */}
      <div className="p-2.5 rounded-[4px] bg-slate-100 dark:bg-slate-900 border border-surface-border dark:border-surface-dark-border">
        <p className="text-[10px] font-semibold text-cocoa dark:text-text-dark-primary mb-1.5 flex items-center gap-1">
          <AlertCircle size={12} className="text-sky" />
          Test Demonstrator Switcher:
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => loadPresetScenario('SOLE_PROPRIETOR')}
            className={`text-[10px] p-1.5 rounded-[4px] border font-medium transition-all ${
              state.businessType === 'SOLE_PROPRIETOR' && !state.isNewToBank
                ? 'bg-sky text-cocoa font-bold border-sky'
                : 'bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary border-surface-border hover:border-sky/40'
            }`}
          >
            Sole Proprietor
          </button>
          <button
            type="button"
            onClick={() => loadPresetScenario('PARTNERSHIP')}
            className={`text-[10px] p-1.5 rounded-[4px] border font-medium transition-all ${
              state.businessType === 'PARTNERSHIP'
                ? 'bg-sky text-cocoa font-bold border-sky'
                : 'bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary border-surface-border hover:border-sky/40'
            }`}
          >
            Partnership
          </button>
          <button
            type="button"
            onClick={() => loadPresetScenario('LIMITED_COMPANY')}
            className={`text-[10px] p-1.5 rounded-[4px] border font-medium transition-all ${
              state.businessType === 'LIMITED_COMPANY'
                ? 'bg-sky text-cocoa font-bold border-sky'
                : 'bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary border-surface-border hover:border-sky/40'
            }`}
          >
            Limited Co (CR12)
          </button>
          <button
            type="button"
            onClick={() => loadPresetScenario('NTB')}
            className={`text-[10px] p-1.5 rounded-[4px] border font-medium transition-all ${
              state.isNewToBank
                ? 'bg-sky text-cocoa font-bold border-sky'
                : 'bg-white dark:bg-surface-dark-paper text-cocoa dark:text-text-dark-primary border-surface-border hover:border-sky/40'
            }`}
          >
            New-To-Bank (NTB)
          </button>
        </div>
      </div>
    </div>
  )
}
