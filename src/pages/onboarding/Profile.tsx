// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 5: Personal Details & Prefilled T24 Profile (65/35)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowRight, ShieldCheck, User } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'

export default function Profile() {
  const navigate = useNavigate()
  const { state, updatePersonalDetails } = useOnboarding()

  const [fullName, setFullName] = useState(state.fullName || 'Bonface Macharia')
  const [dob, setDob] = useState(state.dob || '1990-05-14')
  const [kraPin, setKraPin] = useState(state.kraPin || 'A002891928Z')
  const [email, setEmail] = useState(state.email || 'b.macharia@kiamisuppliers.co.ke')
  const [educationLevel, setEducationLevel] = useState(
    state.educationLevel || 'Undergraduate Degree'
  )
  const [emergencyContact, setEmergencyContact] = useState(
    state.emergencyContact || '0722 998 877 (Grace Macharia - Spouse)'
  )

  const isT24Customer = !state.isNewToBank && state.t24Status === 'EXISTING_CUSTOMER'
  const isNcbaNow = state.ncbaNowCompleted

  function handleSaveAndContinue() {
    updatePersonalDetails({
      fullName,
      dob,
      kraPin,
      email,
      educationLevel,
      emergencyContact,
    })
    navigate('/customer/kyc')
  }

  const leftContent = (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            Personal & Identification Details
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            {isT24Customer
              ? 'Core identifiers verified from your NCBA Core Banking (T24) account are locked for security.'
              : isNcbaNow
              ? 'Identifiers populated from your newly opened NCBA NOW account.'
              : 'Please verify and complete your personal profile details.'}
          </p>
        </div>

        {/* Informational Status Banner */}
        <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-cocoa dark:text-text-dark-primary">
            <CheckCircle2 size={15} className="text-mediterranean shrink-0" />
            {isT24Customer
              ? 'Core Banking Records Matched (CIF: CIF-0089211)'
              : isNcbaNow
              ? 'NCBA NOW Profile Created & Linked'
              : 'Verified Phone & ID Session'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-[20px] bg-mediterranean-tint text-cocoa border border-mediterranean/40">
            {isT24Customer ? 'From NCBA T24' : 'From NCBA NOW'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <Input
              label="Full Legal Names (as per National ID)"
              value={fullName}
              disabled={isT24Customer}
              onChange={(e) => setFullName(e.target.value)}
              badgeText={isT24Customer ? 'From NCBA T24' : undefined}
              helperText={isT24Customer ? 'Verified from NCBA KYC records' : undefined}
            />
          </div>

          {/* National ID */}
          <div>
            <Input
              label="National ID Number"
              value={state.nationalId}
              disabled
              badgeText="Verified ID"
              helperText="Validated in step 4"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              disabled={isT24Customer}
              onChange={(e) => setDob(e.target.value)}
              badgeText={isT24Customer ? 'From NCBA T24' : undefined}
            />
          </div>

          {/* KRA PIN */}
          <div>
            <Input
              label="Personal KRA PIN"
              value={kraPin}
              disabled={isT24Customer}
              onChange={(e) => setKraPin(e.target.value.toUpperCase())}
              badgeText={isT24Customer ? 'From NCBA T24' : undefined}
            />
          </div>

          {/* Registered Mobile */}
          <div>
            <Input
              label="Primary Mobile Number"
              value={state.phone}
              disabled
              badgeText="OTP Verified"
            />
          </div>

          {/* Email Address */}
          <div className="sm:col-span-2">
            <Input
              label="Business / Personal Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="applicant@domain.co.ke"
              helperText="Facility approval notices and statements will be sent here."
            />
          </div>

          {/* Education Level */}
          <div>
            <Select
              label="Highest Education Level"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              options={[
                { value: 'Secondary School (KCSE)', label: 'Secondary School (KCSE)' },
                { value: 'Certificate / Diploma', label: 'Certificate / Diploma' },
                { value: 'Undergraduate Degree', label: 'Undergraduate Degree' },
                { value: 'Postgraduate / Masters', label: 'Postgraduate / Masters' },
                { value: 'Professional Qualification', label: 'Professional Qualification' },
              ]}
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <Input
              label="Emergency Contact (Name & Phone)"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Name & 07XX XXX XXX"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            full
            size="md"
            onClick={handleSaveAndContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            Save & Continue to KYC Uploads
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={5}
        totalSteps={12}
        stepTitle="Personal Profile"
        backPath="/customer/identity"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 5: Personal Profile"
          subtitle="Confirm your verified identity details and primary contact"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="personal" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}
