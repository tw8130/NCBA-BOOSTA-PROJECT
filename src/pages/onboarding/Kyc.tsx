import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Stepper } from '../../components/ui/Stepper'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'
import { DocumentUploader, type DocStatus } from '../../components/domain/DocumentUploader'

export default function Kyc() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<Record<string, DocStatus>>({ idFront: 'EMPTY', idBack: 'EMPTY', selfie: 'EMPTY' })
  const allVerified = Object.values(status).every((s) => s === 'VERIFIED')

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary px-4 py-8 flex flex-col justify-center transition-colors">
      <div className="max-w-md mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={3} />
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">Identity Check</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Verify Your Identity
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            We confirm your national identity documents and facial image to secure your account.
          </p>
        </div>

        <Card className="p-5">
          <DocumentUploader label="National ID — front" onStatusChange={(s) => setStatus((p) => ({ ...p, idFront: s }))} />
          <DocumentUploader label="National ID — back" onStatusChange={(s) => setStatus((p) => ({ ...p, idBack: s }))} />
          <DocumentUploader label="Profile photograph / live selfie" onStatusChange={(s) => setStatus((p) => ({ ...p, selfie: s }))} />

          <Button full className="mt-4" disabled={!allVerified} onClick={() => navigate('/customer/business-documents')}>
            Continue to Business Documents
          </Button>
        </Card>
      </div>
    </div>
  )
}
