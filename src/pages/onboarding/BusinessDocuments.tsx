import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, User, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Stepper } from '../../components/ui/Stepper'
import { LoadingState } from '../../components/ui/LoadingState'
import { DocumentUploader, type DocStatus } from '../../components/domain/DocumentUploader'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'

type Entity = 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'LIMITED_COMPANY'

const entities: { id: Entity; label: string; icon: typeof User }[] = [
  { id: 'SOLE_PROPRIETOR', label: 'Sole proprietor', icon: User },
  { id: 'PARTNERSHIP', label: 'Partnership', icon: Users },
  { id: 'LIMITED_COMPANY', label: 'Limited company (CR12)', icon: Building2 },
]

const docsByEntity: Record<Entity, { key: string; label: string; required: boolean }[]> = {
  SOLE_PROPRIETOR: [
    { key: 'kraPersonal', label: 'Personal KRA PIN certificate', required: true },
    { key: 'kraBusiness', label: 'Business KRA PIN certificate', required: true },
    { key: 'permit', label: 'Single business permit / license', required: true },
  ],
  PARTNERSHIP: [
    { key: 'kraPersonal', label: 'Personal KRA PIN certificate (all partners)', required: true },
    { key: 'kraBusiness', label: 'Business KRA PIN certificate', required: true },
    { key: 'cor', label: 'Certificate of Registration (COR)', required: true },
    { key: 'deed', label: 'Partnership deed', required: false },
  ],
  LIMITED_COMPANY: [
    { key: 'kraPersonal', label: 'Personal KRA PIN certificate (directors)', required: true },
    { key: 'kraBusiness', label: 'Business KRA PIN certificate', required: true },
    { key: 'coi', label: 'Certificate of Incorporation (COI)', required: true },
    { key: 'cr12', label: 'Official CR12 document', required: true },
    { key: 'cr1', label: 'CR1', required: false },
    { key: 'cr2', label: 'CR2', required: false },
    { key: 'cr8', label: 'CR8', required: false },
  ],
}

export default function BusinessDocuments() {
  const navigate = useNavigate()
  const [entity, setEntity] = useState<Entity | null>(null)
  const [statuses, setStatuses] = useState<Record<string, DocStatus>>({})
  const [submitting, setSubmitting] = useState(false)

  const docs = entity ? docsByEntity[entity] : []
  const requiredDocs = docs.filter((d) => d.required)
  const allRequiredUploaded = requiredDocs.every((d) => statuses[d.key] === 'VERIFIED')

  function submit() {
    setSubmitting(true)
    setTimeout(() => navigate('/customer/account-verification'), 1200)
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg flex items-center justify-center">
        <LoadingState label="Saving business entity and documents…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary px-4 py-8 flex flex-col justify-center transition-colors">
      <div className="max-w-md mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={4} />
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">Business KYB</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Verify Your Business
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Select your legal entity type to provide the required registration certificates.
          </p>
        </div>

        <Card className="p-5">
          <p className="text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-2">
            Select Entity Type
          </p>
          <div className="space-y-2 mb-5">
            {entities.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setEntity(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-[4px] border text-left transition-colors ${
                  entity === id
                    ? 'border-sky bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-white'
                    : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary hover:border-sky/30'
                }`}
              >
                <Icon size={18} className="text-cocoa dark:text-sky shrink-0" />
                <span className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary">{label}</span>
              </button>
            ))}
          </div>

          {entity && (
            <div className="space-y-4 pt-2 border-t border-surface-border dark:border-surface-dark-border">
              <Input
                label="Registered Business Name"
                defaultValue="Macharia General Traders"
                helperText="Must match official KRA / CR12 registration."
              />

              <div>
                <p className="text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary mb-2">
                  Required Entity Certificates
                </p>
                {docs.map((d) => (
                  <DocumentUploader
                    key={d.key}
                    label={d.label}
                    required={d.required}
                    onStatusChange={(s) => setStatuses((p) => ({ ...p, [d.key]: s }))}
                  />
                ))}
              </div>
            </div>
          )}

          <Button full className="mt-4" disabled={!entity || !allRequiredUploaded} onClick={submit}>
            Continue to Account Verification
          </Button>
        </Card>
      </div>
    </div>
  )
}
