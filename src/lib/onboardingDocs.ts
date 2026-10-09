// -----------------------------------------------------------------------------
// NCBA BOOSTA — Entity Document Requirements
// -----------------------------------------------------------------------------

import type { BusinessType } from '../types'

export interface DocumentRequirement {
  id: string
  label: string
  description: string
  required: boolean
  tag?: string
  acceptTypes?: string
}

export const ENTITY_DOCUMENTS: Record<BusinessType, DocumentRequirement[]> = {
  SOLE_PROPRIETOR: [
    {
      id: 'single_business_permit',
      label: 'Single Business Permit',
      description: 'Valid county business permit for current financial year',
      required: true,
      tag: 'County Permit',
    },
    {
      id: 'business_registration_cert',
      label: 'Business Registration Certificate (BN/2)',
      description: 'Certificate of registration of Business Name',
      required: true,
      tag: 'BRS Registration',
    },
    {
      id: 'kra_pin_cert',
      label: 'KRA PIN Certificate',
      description: 'Personal or Business KRA PIN certificate with valid tax compliance status',
      required: true,
      tag: 'Tax PIN',
    },
  ],
  PARTNERSHIP: [
    {
      id: 'partnership_deed',
      label: 'Partnership Deed / Agreement',
      description: 'Duly executed partnership agreement specifying share capital and powers',
      required: true,
      tag: 'Legal Deed',
    },
    {
      id: 'business_registration_cert',
      label: 'Certificate of Registration (BN/2)',
      description: 'Official Business Registration Certificate from Registrar of Companies',
      required: true,
      tag: 'BRS Registration',
    },
    {
      id: 'partner_roster_doc',
      label: 'Partner Identity Records & Roster',
      description: 'National IDs and KRA PIN certificates for all active partners',
      required: true,
      tag: 'Signatories',
    },
    {
      id: 'kra_business_pin',
      label: 'Partnership KRA PIN Certificate',
      description: 'Business entity PIN registered with KRA (Optional if personal attached)',
      required: false,
      tag: 'Optional',
    },
  ],
  LIMITED_COMPANY: [
    {
      id: 'cr12',
      label: 'CR12 Official Search Certificate',
      description: 'Issued by Registrar of Companies within the last 90 days',
      required: true,
      tag: 'CR12 Search',
    },
    {
      id: 'certificate_of_incorporation',
      label: 'Certificate of Incorporation',
      description: 'Form CR3 or original Certificate of Incorporation under Companies Act',
      required: true,
      tag: 'Incorporation',
    },
    {
      id: 'director_roster_doc',
      label: 'Director List & Identification',
      description: 'IDs & KRA PINs of all directors listed on CR12',
      required: true,
      tag: 'Director Roster',
    },
    {
      id: 'kra_company_pin',
      label: 'Company KRA PIN & Tax Compliance',
      description: 'Corporate KRA PIN certificate',
      required: false,
      tag: 'Optional KRA',
    },
    {
      id: 'cr1_memo',
      label: 'Memorandum & Articles / CR1',
      description: 'Company regulations and objects (Optional)',
      required: false,
      tag: 'Optional CR1',
    },
    {
      id: 'cr2_model_articles',
      label: 'Model Articles Adoption / CR2',
      description: 'Company standard articles adoption filing (Optional)',
      required: false,
      tag: 'Optional CR2',
    },
    {
      id: 'cr8_residential_address',
      label: 'Notice of Residential Address / CR8',
      description: 'Registered office or director residential notice (Optional)',
      required: false,
      tag: 'Optional CR8',
    },
  ],
}
