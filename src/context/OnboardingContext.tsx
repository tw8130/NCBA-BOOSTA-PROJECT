// -----------------------------------------------------------------------------
// NCBA BOOSTA — Customer Onboarding State Context
// -----------------------------------------------------------------------------

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { BusinessType, MandateType, GeoCapture, Signatory } from '../types'
import type { T24CustomerRecord, T24LookupStatus } from '../services/t24'
import type { DocStatus } from '../components/domain/DocumentUploader'
import { ENTITY_DOCUMENTS } from '../lib/onboardingDocs'

export interface DocumentState {
  status: DocStatus
  fileName?: string
  fileSize?: string
  updatedAt?: string
}

export interface OnboardingState {
  // 1. Phone & Auth
  phone: string
  otpVerified: boolean
  pinCreated: boolean

  // 2. Identity & T24
  nationalId: string
  t24Status: T24LookupStatus | 'IDLE'
  t24Customer: T24CustomerRecord | null
  isNewToBank: boolean
  ncbaNowCompleted: boolean
  prefilledFromT24: string[]

  // 3. Personal
  fullName: string
  dob: string
  kraPin: string
  email: string
  educationLevel: string
  emergencyContact: string

  // 4. KYC
  idFrontStatus: DocStatus
  idBackStatus: DocStatus
  selfieCaptureUrl: string | null
  selfieStatus: DocStatus

  // 5. Business Profile
  businessName: string
  tradingName: string
  registrationNumber: string
  sector: string
  employees: number
  dateStarted: string
  county: string
  subCounty: string

  // 6. Premises Geolocation & Viewfinder
  premises: GeoCapture | null
  premisesMode: 'LIVE_GPS' | 'FALLBACK_UPLOAD' | 'DEMO_PRESET' | null

  // 7. Entity & Documents
  businessType: BusinessType
  documents: Record<string, DocumentState>

  // 8. Mandate & Signatory Roster
  mandate: MandateType
  signatories: Signatory[]
  applicantSignature: string | null

  // 9. Account Verification
  accountNumber: string
  accountVerifyStatus: 'IDLE' | 'VERIFYING' | 'SUCCESS' | 'NOT_FOUND' | 'MISMATCH' | 'UNAVAILABLE'
  verifiedAccountName: string
  verifiedBranch: string

  // 10. Selected Anchors
  selectedAnchorIds: string[]
  indicativeFacilityLimit: number
}

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  phone: '0712 345 678',
  otpVerified: false,
  pinCreated: false,

  nationalId: '24567891',
  t24Status: 'IDLE',
  t24Customer: null,
  isNewToBank: false,
  ncbaNowCompleted: false,
  prefilledFromT24: [],

  fullName: 'Bonface Macharia',
  dob: '1990-05-14',
  kraPin: 'A002891928Z',
  email: 'b.macharia@kiamisuppliers.co.ke',
  educationLevel: 'Undergraduate Degree',
  emergencyContact: '0722 998 877 (Grace Macharia - Spouse)',

  idFrontStatus: 'EMPTY',
  idBackStatus: 'EMPTY',
  selfieCaptureUrl: null,
  selfieStatus: 'EMPTY',

  businessName: 'Kiami General Supplies Ltd',
  tradingName: 'Kiami Wholesale & Distribution',
  registrationNumber: 'BN/2018/89412',
  sector: 'Fast Moving Consumer Goods (FMCG)',
  employees: 14,
  dateStarted: '2018-06-12',
  county: 'Nairobi',
  subCounty: 'Embakasi North',

  premises: null,
  premisesMode: null,

  businessType: 'SOLE_PROPRIETOR',
  documents: {
    single_business_permit: { status: 'EMPTY' },
    business_registration_cert: { status: 'EMPTY' },
    kra_pin_cert: { status: 'EMPTY' },
  },

  mandate: 'SINGLE',
  signatories: [
    {
      id: 'sig-applicant',
      fullName: 'Bonface Macharia',
      nationalId: '24567891',
      phone: '0712 345 678',
      role: 'DIRECTOR',
      status: 'APPROVED',
    },
  ],
  applicantSignature: null,

  accountNumber: '1023 445 566',
  accountVerifyStatus: 'IDLE',
  verifiedAccountName: '',
  verifiedBranch: '',

  selectedAnchorIds: ['anchor-eabl', 'anchor-coke'],
  indicativeFacilityLimit: 5000000,
}

export interface OnboardingContextValue {
  state: OnboardingState
  setPhone: (phone: string) => void
  setOtpVerified: (verified: boolean) => void
  setPinCreated: (created: boolean) => void
  setIdentityResult: (
    status: T24LookupStatus,
    customer: T24CustomerRecord | null,
    isNtb: boolean,
    nationalId: string
  ) => void
  setNcbaNowSuccess: (accountNumber: string, cif: string) => void
  updatePersonalDetails: (details: Partial<OnboardingState>) => void
  updateKycDoc: (field: 'idFrontStatus' | 'idBackStatus' | 'selfieStatus', status: DocStatus) => void
  setSelfieCapture: (url: string | null) => void
  updateBusinessProfile: (details: Partial<OnboardingState>) => void
  setPremisesCapture: (
    capture: GeoCapture | null,
    mode?: 'LIVE_GPS' | 'FALLBACK_UPLOAD' | 'DEMO_PRESET'
  ) => void
  setBusinessType: (type: BusinessType) => void
  setDocumentState: (docId: string, docState: DocumentState) => void
  setMandate: (mandate: MandateType) => void
  addSignatory: (signatory: Omit<Signatory, 'id' | 'status'>) => void
  removeSignatory: (id: string) => void
  setApplicantSignature: (signatureUrl: string | null) => void
  setAccountVerification: (
    accountNumber: string,
    status: OnboardingState['accountVerifyStatus'],
    name?: string,
    branch?: string
  ) => void
  toggleAnchor: (anchorId: string) => void
  selectAllAnchors: (allIds: string[]) => void
  deselectAllAnchors: () => void
  loadPresetScenario: (scenario: 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'LIMITED_COMPANY' | 'NTB') => void
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING_STATE)

  function setPhone(phone: string) {
    setState((s) => ({ ...s, phone }))
  }

  function setOtpVerified(otpVerified: boolean) {
    setState((s) => ({ ...s, otpVerified }))
  }

  function setPinCreated(pinCreated: boolean) {
    setState((s) => ({ ...s, pinCreated }))
  }

  function setIdentityResult(
    status: T24LookupStatus,
    customer: T24CustomerRecord | null,
    isNtb: boolean,
    nationalId: string
  ) {
    setState((s) => {
      if (customer) {
        return {
          ...s,
          nationalId,
          t24Status: status,
          t24Customer: customer,
          isNewToBank: false,
          fullName: customer.fullName,
          dob: customer.dob,
          kraPin: customer.kraPin,
          email: customer.email || s.email,
          phone: customer.phone || s.phone,
          prefilledFromT24: customer.prefilledFields,
          accountNumber: customer.accounts[0]?.number || s.accountNumber,
          indicativeFacilityLimit: customer.indicativeLimit,
        }
      }
      return {
        ...s,
        nationalId,
        t24Status: status,
        isNewToBank: isNtb,
      }
    })
  }

  function setNcbaNowSuccess(newAccount: string, cif: string) {
    setState((s) => ({
      ...s,
      isNewToBank: true,
      ncbaNowCompleted: true,
      accountNumber: newAccount,
      accountVerifyStatus: 'SUCCESS',
      verifiedAccountName: s.businessName || `${s.fullName} Enterprise`,
      verifiedBranch: 'Digital Onboarding Branch',
      prefilledFromT24: [...s.prefilledFromT24, 'ncbaAccount', 'cif'],
      t24Customer: s.t24Customer
        ? {
            ...s.t24Customer,
            cif,
            accounts: [
              {
                number: newAccount,
                name: s.businessName || `${s.fullName} Enterprise`,
                currency: 'KES',
                type: 'Digital Business Current',
                branch: 'Digital Onboarding Branch',
              },
            ],
          }
        : null,
    }))
  }

  function updatePersonalDetails(details: Partial<OnboardingState>) {
    setState((s) => ({ ...s, ...details }))
  }

  function updateKycDoc(field: 'idFrontStatus' | 'idBackStatus' | 'selfieStatus', status: DocStatus) {
    setState((s) => ({ ...s, [field]: status }))
  }

  function setSelfieCapture(url: string | null) {
    setState((s) => ({
      ...s,
      selfieCaptureUrl: url,
      selfieStatus: url ? 'VERIFIED' : 'EMPTY',
    }))
  }

  function updateBusinessProfile(details: Partial<OnboardingState>) {
    setState((s) => ({ ...s, ...details }))
  }

  function setPremisesCapture(
    premises: GeoCapture | null,
    premisesMode: 'LIVE_GPS' | 'FALLBACK_UPLOAD' | 'DEMO_PRESET' = 'LIVE_GPS'
  ) {
    setState((s) => ({ ...s, premises, premisesMode }))
  }

  function setBusinessType(type: BusinessType) {
    setState((s) => {
      // Re-init document checklist according to selected entity
      const reqDocs = ENTITY_DOCUMENTS[type] || []
      const newDocs: Record<string, DocumentState> = {}
      reqDocs.forEach((d) => {
        newDocs[d.id] = s.documents[d.id] || { status: 'EMPTY' }
      })

      // Adjust mandate if sole proprietor
      const updatedMandate = type === 'SOLE_PROPRIETOR' ? 'SINGLE' : s.mandate

      return {
        ...s,
        businessType: type,
        mandate: updatedMandate,
        documents: newDocs,
      }
    })
  }

  function setDocumentState(docId: string, docState: DocumentState) {
    setState((s) => ({
      ...s,
      documents: {
        ...s.documents,
        [docId]: docState,
      },
    }))
  }

  function setMandate(mandate: MandateType) {
    setState((s) => ({ ...s, mandate }))
  }

  function addSignatory(sig: Omit<Signatory, 'id' | 'status'>) {
    setState((s) => ({
      ...s,
      signatories: [
        ...s.signatories,
        {
          ...sig,
          id: `sig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'PENDING',
        },
      ],
    }))
  }

  function removeSignatory(id: string) {
    setState((s) => ({
      ...s,
      signatories: s.signatories.filter((item) => item.id !== id),
    }))
  }

  function setApplicantSignature(applicantSignature: string | null) {
    setState((s) => ({ ...s, applicantSignature }))
  }

  function setAccountVerification(
    accountNumber: string,
    status: OnboardingState['accountVerifyStatus'],
    name = '',
    branch = ''
  ) {
    setState((s) => ({
      ...s,
      accountNumber,
      accountVerifyStatus: status,
      verifiedAccountName: name,
      verifiedBranch: branch,
    }))
  }

  function toggleAnchor(anchorId: string) {
    setState((s) => {
      const exists = s.selectedAnchorIds.includes(anchorId)
      return {
        ...s,
        selectedAnchorIds: exists
          ? s.selectedAnchorIds.filter((id) => id !== anchorId)
          : [...s.selectedAnchorIds, anchorId],
      }
    })
  }

  function selectAllAnchors(allIds: string[]) {
    setState((s) => ({ ...s, selectedAnchorIds: allIds }))
  }

  function deselectAllAnchors() {
    setState((s) => ({ ...s, selectedAnchorIds: [] }))
  }

  function loadPresetScenario(scenario: 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'LIMITED_COMPANY' | 'NTB') {
    if (scenario === 'SOLE_PROPRIETOR') {
      setState({
        ...DEFAULT_ONBOARDING_STATE,
        businessType: 'SOLE_PROPRIETOR',
        mandate: 'SINGLE',
        businessName: 'Macharia General Retailers',
        tradingName: 'Macharia Duka Express',
        accountNumber: '1023 445 566',
        accountVerifyStatus: 'SUCCESS',
        verifiedAccountName: 'Bonface Macharia T/A Macharia General Retailers',
        signatories: [
          {
            id: 'sig-applicant',
            fullName: 'Bonface Macharia',
            nationalId: '24567891',
            phone: '0712 345 678',
            role: 'DIRECTOR',
            status: 'APPROVED',
          },
        ],
      })
    } else if (scenario === 'PARTNERSHIP') {
      setState({
        ...DEFAULT_ONBOARDING_STATE,
        businessType: 'PARTNERSHIP',
        mandate: 'JOINT_ANY',
        businessName: 'Macharia & Kimani Fresh Distributors',
        tradingName: 'MK Agro Distributors',
        registrationNumber: 'BN/2019/33214',
        signatories: [
          {
            id: 'sig-applicant',
            fullName: 'Bonface Macharia',
            nationalId: '24567891',
            phone: '0712 345 678',
            role: 'PARTNER',
            status: 'APPROVED',
          },
          {
            id: 'sig-partner-1',
            fullName: 'David Kimani Mwangi',
            nationalId: '26781299',
            phone: '0721 889 900',
            email: 'david.kimani@mkagro.co.ke',
            role: 'PARTNER',
            status: 'PENDING',
          },
        ],
        documents: {
          partnership_deed: { status: 'VERIFIED', fileName: 'Partnership_Deed_Executed.pdf' },
          business_registration_cert: { status: 'VERIFIED', fileName: 'BN2_Registration.pdf' },
          partner_roster_doc: { status: 'VERIFIED', fileName: 'Partners_KRA_IDs.pdf' },
        },
      })
    } else if (scenario === 'LIMITED_COMPANY') {
      setState({
        ...DEFAULT_ONBOARDING_STATE,
        businessType: 'LIMITED_COMPANY',
        mandate: 'JOINT_ALL',
        businessName: 'Kiami Logistics & Supply Chain Ltd',
        tradingName: 'Kiami Logistics',
        registrationNumber: 'PVT-AAA19482',
        signatories: [
          {
            id: 'sig-applicant',
            fullName: 'Bonface Macharia',
            nationalId: '24567891',
            phone: '0712 345 678',
            role: 'DIRECTOR',
            status: 'APPROVED',
          },
          {
            id: 'sig-dir-2',
            fullName: 'Sarah Nekesa Wanjala',
            nationalId: '25419920',
            phone: '0733 445 566',
            email: 'sarah.nekesa@kiamilogistics.co.ke',
            role: 'DIRECTOR',
            status: 'PENDING',
          },
          {
            id: 'sig-dir-3',
            fullName: 'Peter Otieno Odhiambo',
            nationalId: '27889102',
            phone: '0710 223 344',
            email: 'peter.otieno@kiamilogistics.co.ke',
            role: 'DIRECTOR',
            status: 'PENDING',
          },
        ],
        documents: {
          cr12: { status: 'VERIFIED', fileName: 'CR12_Official_Search_2026.pdf' },
          certificate_of_incorporation: { status: 'VERIFIED', fileName: 'Certificate_Incorporation.pdf' },
          director_roster_doc: { status: 'VERIFIED', fileName: 'Directors_Roster_KRA.pdf' },
        },
      })
    } else if (scenario === 'NTB') {
      setState({
        ...DEFAULT_ONBOARDING_STATE,
        isNewToBank: true,
        ncbaNowCompleted: true,
        nationalId: '30123456',
        fullName: 'Alex Mutua Musyoka',
        phone: '0733 123 456',
        accountNumber: '1048 782 104',
        accountVerifyStatus: 'SUCCESS',
        verifiedAccountName: 'Musyoka General Enterprises',
        verifiedBranch: 'Digital Onboarding Branch',
        prefilledFromT24: ['ncbaAccount'],
      })
    }
  }

  function resetOnboarding() {
    setState(DEFAULT_ONBOARDING_STATE)
  }

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setPhone,
        setOtpVerified,
        setPinCreated,
        setIdentityResult,
        setNcbaNowSuccess,
        updatePersonalDetails,
        updateKycDoc,
        setSelfieCapture,
        updateBusinessProfile,
        setPremisesCapture,
        setBusinessType,
        setDocumentState,
        setMandate,
        addSignatory,
        removeSignatory,
        setApplicantSignature,
        setAccountVerification,
        toggleAnchor,
        selectAllAnchors,
        deselectAllAnchors,
        loadPresetScenario,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
