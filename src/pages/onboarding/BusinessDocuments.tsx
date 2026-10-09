// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 9: Legal Entity Selection & Conditional Documents (65/35)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Users, Building2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DocumentUploader, type DocStatus } from '../../components/domain/DocumentUploader'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import { ENTITY_DOCUMENTS } from '../../lib/onboardingDocs'
import type { BusinessType } from '../../types'

const ENTITY_CARDS: {
  id: BusinessType
  title: string
  subtitle: string
  icon: typeof User
}[] = [
  {
    id: 'SOLE_PROPRIETOR',
    title: 'Sole Proprietorship',
    subtitle: 'Single owner business registered under Business Names Act (BN/2).',
    icon: User,
  },
  {
    id: 'PARTNERSHIP',
    title: 'Registered Partnership',
    subtitle: 'Two or more general partners with a registered partnership deed.',
    icon: Users,
  },
  {
    id: 'LIMITED_COMPANY',
    title: 'Limited Liability Company',
    subtitle: 'Incorporated private company (Ltd/PLC) with CR12 director roster.',
    icon: Building2,
  },
]

export default function BusinessDocuments() {
  const navigate = useNavigate()
  const { state, setBusinessType, setDocumentState } = useOnboarding()

  const currentType = state.businessType || 'SOLE_PROPRIETOR'
  const entityDocs = ENTITY_DOCUMENTS[currentType] || []
  const requiredDocs = entityDocs.filter((d) => d.required)

  const allRequiredVerified =
    requiredDocs.length > 0 &&
    requiredDocs.every((d) => state.documents[d.id]?.status === 'VERIFIED')

  function handleSelectEntity(type: BusinessType) {
    setBusinessType(type)
  }

  function handleDocStatusChange(
    docId: string,
    status: DocStatus,
    meta?: { name: string; size: string }
  ) {
    setDocumentState(docId, {
      status,
      fileName: meta?.name,
      fileSize: meta?.size,
      updatedAt: new Date().toISOString(),
    })
  }

  function handleQuickVerifyAll() {
    entityDocs.forEach((d) => {
      setDocumentState(d.id, {
        status: 'VERIFIED',
        fileName: `${d.label.replace(/[^a-zA-Z0-9]/g, '_')}_Official.pdf`,
        fileSize: '1.8 MB',
        updatedAt: new Date().toISOString(),
      })
    })
  }

  function handleContinue() {
    navigate('/customer/mandate')
  }

  const leftContent = (
    <div className="space-y-5">
      {/* Entity Selector Radio Cards */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            1. Select Legal Entity Structure
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Your legal business registration structure determines the statutory documents required by the bank.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ENTITY_CARDS.map(({ id, title, subtitle, icon: Icon }) => {
            const isSelected = currentType === id
            return (
              <div
                key={id}
                onClick={() => handleSelectEntity(id)}
                className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky bg-sky-tint/30 dark:bg-sky/15 ring-1 ring-sky/50'
                    : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper hover:border-sky/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-[4px] flex items-center justify-center ${
                        isSelected
                          ? 'bg-sky text-cocoa font-bold'
                          : 'bg-black/5 dark:bg-white/5 text-text-light-secondary dark:text-text-dark-secondary'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => handleSelectEntity(id)}
                      className="text-sky focus:ring-sky"
                    />
                  </div>
                  <h3 className="text-[13px] font-bold text-cocoa dark:text-text-dark-primary">
                    {title}
                  </h3>
                  <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-snug">
                    {subtitle}
                  </p>
                </div>

                {isSelected && (
                  <span className="mt-2 text-[10px] font-bold text-sky uppercase tracking-wider">
                    Selected Entity
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Conditional Document Uploaders */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
              2. Required Documents for {currentType.replace('_', ' ')}
            </h3>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Upload certified copies of registration certificates and company records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickVerifyAll}
            className="text-[10px] font-bold px-2 py-1 rounded-[4px] bg-sky text-cocoa hover:bg-sky-hover transition-colors shrink-0"
          >
            Auto-Verify All (Demo)
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {entityDocs.map((doc) => {
            const currentDocState = state.documents[doc.id] || { status: 'EMPTY' }
            return (
              <DocumentUploader
                key={`${currentType}-${doc.id}`}
                label={doc.label}
                description={doc.description}
                required={doc.required}
                tag={doc.tag}
                status={currentDocState.status}
                fileName={currentDocState.fileName}
                onStatusChange={(status, meta) => handleDocStatusChange(doc.id, status, meta)}
              />
            )
          })}
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            disabled={!allRequiredVerified}
            onClick={handleContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            {allRequiredVerified
              ? 'Continue to Mandate & Signatory Roster'
              : 'Verify All Required Certificates to Continue'}
          </Button>
        </div>

        <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
          <ShieldCheck size={16} className="text-mediterranean shrink-0 mt-0.5" />
          <p>
            Certificates are automatically cross-referenced with the Business Registration Service (BRS) and KRA iTax APIs.
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={9}
        totalSteps={12}
        stepTitle="Legal Documents"
        backPath="/customer/premises"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 9: Entity Structure & Conditional Documents"
          subtitle="Sole Proprietor, Partnership, or Limited Company compliance certificates"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="documents" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
