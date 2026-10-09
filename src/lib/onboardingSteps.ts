// -----------------------------------------------------------------------------
// NCBA BOOSTA — Onboarding Step Definitions
// -----------------------------------------------------------------------------

export interface OnboardingStepDef {
  id: string
  label: string
  shortLabel: string
  path: string
  description: string
  stageNumber: number
}

export const ONBOARDING_FLOW_STEPS: OnboardingStepDef[] = [
  {
    id: 'mobile',
    label: 'Mobile Activation',
    shortLabel: 'Mobile',
    path: '/customer/signup',
    description: 'Verify your pre-approved mobile number',
    stageNumber: 1,
  },
  {
    id: 'otp',
    label: 'OTP Verification',
    shortLabel: 'OTP',
    path: '/customer/otp',
    description: 'Enter 6-digit security code',
    stageNumber: 2,
  },
  {
    id: 'pin',
    label: 'Security PIN',
    shortLabel: 'PIN',
    path: '/customer/create-pin',
    description: 'Create your 4-digit transaction PIN',
    stageNumber: 3,
  },
  {
    id: 'identity',
    label: 'Identity Lookup',
    shortLabel: 'Identity',
    path: '/customer/identity',
    description: 'Core banking verification & KYC match',
    stageNumber: 4,
  },
  {
    id: 'personal',
    label: 'Personal Details',
    shortLabel: 'Personal',
    path: '/customer/profile',
    description: 'Applicant profile & contact details',
    stageNumber: 5,
  },
  {
    id: 'kyc',
    label: 'ID & Live Selfie',
    shortLabel: 'KYC',
    path: '/customer/kyc',
    description: 'National ID front/back & facial capture',
    stageNumber: 6,
  },
  {
    id: 'business',
    label: 'Business Profile',
    shortLabel: 'Business',
    path: '/customer/business-profile',
    description: 'Enterprise information & operations',
    stageNumber: 7,
  },
  {
    id: 'premises',
    label: 'Premises Verification',
    shortLabel: 'Premises',
    path: '/customer/premises',
    description: 'Live geotagged camera verification',
    stageNumber: 8,
  },
  {
    id: 'documents',
    label: 'Entity Documents',
    shortLabel: 'Documents',
    path: '/customer/business-documents',
    description: 'Legal registration & compliance papers',
    stageNumber: 9,
  },
  {
    id: 'mandate',
    label: 'Mandate & Signature',
    shortLabel: 'Mandate',
    path: '/customer/mandate',
    description: 'Signing authority & partner roster',
    stageNumber: 10,
  },
  {
    id: 'account',
    label: 'NCBA Account',
    shortLabel: 'Account',
    path: '/customer/account-verification',
    description: 'Disbursement & collection account check',
    stageNumber: 11,
  },
  {
    id: 'anchors',
    label: 'Select Anchors',
    shortLabel: 'Anchors',
    path: '/customer/select-anchors',
    description: 'Activate pre-approved corporate anchors',
    stageNumber: 12,
  },
]

// Backwards-compatible string array for simpler steppers if needed
export const ONBOARDING_STEPS = [
  'Verify',
  'PIN',
  'Identity',
  'Personal',
  'KYC',
  'Business',
  'Premises',
  'Documents',
  'Mandate',
  'Account',
  'Anchors',
]
