// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 8: Premises Geotagged Camera Verification (65/35)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { GeoCameraCapture } from '../../components/domain/GeoCameraCapture'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import type { GeoCapture } from '../../types'

export default function Premises() {
  const navigate = useNavigate()
  const { state, setPremisesCapture } = useOnboarding()

  const [capture, setCapture] = useState<GeoCapture | null>(state.premises || null)

  function handleContinue() {
    if (!capture) return
    navigate('/customer/business-documents')
  }

  function handleAutoVerify() {
    const demoCapture: GeoCapture = {
      latitude: -1.292066,
      longitude: 36.821945,
      accuracy: 6,
      timestamp: new Date().toISOString(),
      photoUrl:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%2339302D"/><rect x="50" y="80" width="500" height="240" fill="%233AB3E5" rx="6"/><text x="300" y="190" fill="white" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">KIAMI WHOLESALE PREMISES</text><text x="300" y="230" fill="white" font-family="sans-serif" font-size="14" text-anchor="middle">Nairobi CBD - Verified Storefront</text><rect x="0" y="340" width="600" height="60" fill="black" opacity="0.8"/><text x="20" y="365" fill="%233AB3E5" font-family="monospace" font-size="12">NCBA BOOSTA GPS: -1.292066, 36.821945 (±6m)</text><text x="20" y="385" fill="white" font-family="monospace" font-size="11">TIMESTAMP: 2026-10-08T18:00:00Z - CBK COMPLIANT</text></svg>',
    }
    setCapture(demoCapture)
    setPremisesCapture(demoCapture, 'DEMO_PRESET')
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
              Physical Premises Geotag Verification
            </h2>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              Take a live photo of your shopfront or commercial warehouse with embedded GPS metadata.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoVerify}
            className="text-[10px] font-bold px-2 py-1 rounded-[4px] bg-sky text-cocoa hover:bg-sky-hover transition-colors shrink-0"
          >
            Auto-Geotag (Demo)
          </button>
        </div>

        <GeoCameraCapture
          currentCapture={capture}
          onCapture={(c, mode) => {
            setCapture(c)
            setPremisesCapture(c, mode)
          }}
          onClear={() => {
            setCapture(null)
            setPremisesCapture(null)
          }}
        />

        <div className="pt-2">
          <Button
            full
            size="md"
            disabled={!capture}
            onClick={handleContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            {capture ? 'Proceed to Legal Entity Documents' : 'Capture Geotagged Premises to Continue'}
          </Button>
        </div>

        <div className="p-3 rounded-[4px] bg-sky-tint dark:bg-sky/10 border border-sky/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
          <ShieldCheck size={16} className="text-sky shrink-0 mt-0.5" />
          <p>
            NCBA verifies GPS coordinates against anchor supply route drop-off points to confirm business existence without requiring in-person field inspections.
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={8}
        totalSteps={12}
        stepTitle="Premises Geotag"
        backPath="/customer/business-profile"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 8: Premises Geotag Verification"
          subtitle="Real-time GPS coordinates and storefront photograph verification"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="premises" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
