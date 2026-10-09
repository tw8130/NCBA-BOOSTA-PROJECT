// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 6: KYC Document Uploads & Live Oval Selfie (65/35)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DocumentUploader, type DocStatus } from '../../components/domain/DocumentUploader'
import { SelfieCapture } from '../../components/domain/SelfieCapture'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'

export default function Kyc() {
  const navigate = useNavigate()
  const { state, updateKycDoc, setSelfieCapture } = useOnboarding()

  const [idFrontStatus, setIdFrontStatus] = useState<DocStatus>(state.idFrontStatus || 'EMPTY')
  const [idBackStatus, setIdBackStatus] = useState<DocStatus>(state.idBackStatus || 'EMPTY')
  const [idFrontName, setIdFrontName] = useState<string>('')
  const [idBackName, setIdBackName] = useState<string>('')
  const [selfieUrl, setSelfieUrl] = useState<string | null>(state.selfieCaptureUrl || null)

  const isAllReady =
    idFrontStatus === 'VERIFIED' && idBackStatus === 'VERIFIED' && !!selfieUrl

  function handleContinue() {
    updateKycDoc('idFrontStatus', idFrontStatus)
    updateKycDoc('idBackStatus', idBackStatus)
    updateKycDoc('selfieStatus', 'VERIFIED')
    navigate('/customer/business-profile')
  }

  function handleQuickPassAll() {
    setIdFrontStatus('VERIFIED')
    setIdFrontName('National_ID_Front_Bonface.jpg')
    setIdBackStatus('VERIFIED')
    setIdBackName('National_ID_Back_Bonface.jpg')

    // Create demo verified selfie
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#39302D'
      ctx.fillRect(0, 0, 300, 300)
      ctx.fillStyle = '#3AB3E5'
      ctx.beginPath()
      ctx.arc(150, 120, 50, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(150, 270, 90, 0, Math.PI, true)
      ctx.fill()
    }
    const demoUrl = canvas.toDataURL('image/jpeg')
    setSelfieUrl(demoUrl)
    setSelfieCapture(demoUrl)
    updateKycDoc('idFrontStatus', 'VERIFIED')
    updateKycDoc('idBackStatus', 'VERIFIED')
    updateKycDoc('selfieStatus', 'VERIFIED')
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
              Biometric & Identity Verification
            </h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Upload clear photographs of your National ID card and capture a live selfie with our oval face guide.
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickPassAll}
            className="text-[10px] font-bold px-2 py-1 rounded-[4px] bg-sky text-cocoa hover:bg-sky-hover transition-colors shrink-0"
          >
            Auto-Verify All (Demo)
          </button>
        </div>

        {/* 1. National ID Front */}
        <div>
          <DocumentUploader
            label="National ID Card — Front Side"
            description="Clear photo or scan showing your full photo, name, and ID number."
            tag="ID Front"
            status={idFrontStatus}
            fileName={idFrontName}
            onStatusChange={(status, meta) => {
              setIdFrontStatus(status)
              if (meta) setIdFrontName(meta.name)
              updateKycDoc('idFrontStatus', status)
            }}
          />
        </div>

        {/* 2. National ID Back */}
        <div>
          <DocumentUploader
            label="National ID Card — Back Side"
            description="Clear photo or scan showing the serial number and barcode."
            tag="ID Back"
            status={idBackStatus}
            fileName={idBackName}
            onStatusChange={(status, meta) => {
              setIdBackStatus(status)
              if (meta) setIdBackName(meta.name)
              updateKycDoc('idBackStatus', status)
            }}
          />
        </div>

        {/* 3. Live Facial Selfie with Oval Guide */}
        <div>
          <SelfieCapture
            label="Live Biometric Facial Selfie"
            capturedUrl={selfieUrl}
            onCapture={(url) => {
              setSelfieUrl(url)
              setSelfieCapture(url)
              updateKycDoc('selfieStatus', 'VERIFIED')
            }}
            onClear={() => {
              setSelfieUrl(null)
              setSelfieCapture(null)
              updateKycDoc('selfieStatus', 'EMPTY')
            }}
          />
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            disabled={!isAllReady}
            onClick={handleContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            {isAllReady ? 'Continue to Business Profile' : 'Complete All 3 KYC Items to Continue'}
          </Button>
        </div>

        <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
          <ShieldCheck size={16} className="text-mediterranean shrink-0 mt-0.5" />
          <p>
            NCBA complies with the Kenya Data Protection Act (2019). Biometric selfies are matched against the Integrated Population Registration System (IPRS).
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={6}
        totalSteps={12}
        stepTitle="KYC & Biometrics"
        backPath="/customer/profile"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 6: KYC Document Uploads & Live Selfie"
          subtitle="Upload your National ID and complete live facial verification"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="kyc" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
