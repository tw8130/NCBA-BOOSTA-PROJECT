// -----------------------------------------------------------------------------
// NCBA BOOSTA — Mock T24 Core Banking Gateway Service
// -----------------------------------------------------------------------------

import { normalizeKenyanPhone } from '../lib/validators'

export type T24LookupStatus =
  | 'EXISTING_CUSTOMER'
  | 'NEW_TO_BANK'
  | 'DETAILS_MISMATCH'
  | 'NOT_INVITED'
  | 'UNAVAILABLE'

export interface T24CustomerRecord {
  cif: string
  fullName: string
  nationalId: string
  phone: string
  dob: string
  kraPin: string
  email: string
  accounts: {
    number: string
    name: string
    currency: string
    type: string
    branch: string
  }[]
  indicativeLimit: number
  prefilledFields: string[]
}

export interface T24LookupResult {
  status: T24LookupStatus
  message: string
  customer?: T24CustomerRecord
  ntbBannerText?: string
}

export type T24AccountVerifyStatus =
  | 'SUCCESS'
  | 'NOT_FOUND'
  | 'MISMATCH'
  | 'UNAVAILABLE'

export interface T24AccountVerifyResult {
  status: T24AccountVerifyStatus
  message: string
  accountName?: string
  accountNumber?: string
  branch?: string
  currency?: string
}

// Simulated T24 customer records in core banking
const MOCK_T24_RECORDS: Record<string, T24CustomerRecord> = {
  '24567891': {
    cif: 'CIF-0089211',
    fullName: 'Bonface Macharia',
    nationalId: '24567891',
    phone: '0712345678',
    dob: '1990-05-14',
    kraPin: 'A002891928Z',
    email: 'b.macharia@kiamisuppliers.co.ke',
    accounts: [
      {
        number: '1023445566',
        name: 'Bonface Macharia T/A Kiami General Supplies',
        currency: 'KES',
        type: 'Business Current Account',
        branch: 'Upper Hill Branch',
      },
    ],
    indicativeLimit: 5000000,
    prefilledFields: ['fullName', 'dob', 'nationalId', 'kraPin', 'phone'],
  },
  '28811422': {
    cif: 'CIF-0094120',
    fullName: 'Jane Wanjiku Kamau',
    nationalId: '28811422',
    phone: '0722123456',
    dob: '1987-11-23',
    kraPin: 'A003481944X',
    email: 'jane.kamau@wanjikustores.co.ke',
    accounts: [
      {
        number: '1044556677',
        name: 'Wanjiku Wholesale Retailers',
        currency: 'KES',
        type: 'Corporate Current Account',
        branch: 'Mama Ngina Branch',
      },
    ],
    indicativeLimit: 3500000,
    prefilledFields: ['fullName', 'dob', 'nationalId', 'kraPin', 'phone'],
  },
}

// Whitelisted NTB (New-To-Bank) national IDs with pre-approved facilities
const WHITELISTED_NTB_IDS = new Set(['30123456', '31234567', '29876543'])

export const t24Service = {
  /**
   * Looks up applicant identity against mock T24 Core Banking.
   */
  async lookupIdentity(
    phone: string,
    nationalId: string,
    _accountNumber?: string
  ): Promise<T24LookupResult> {
    await new Promise((res) => setTimeout(res, 650))

    const cleanId = nationalId.trim()
    const normPhone = normalizeKenyanPhone(phone)

    // System unavailable test hook
    if (cleanId === '00000000') {
      return {
        status: 'UNAVAILABLE',
        message: 'NCBA Core Banking (T24) integration is temporarily unavailable. Please try again shortly.',
      }
    }

    // Check if customer exists in T24
    const existing = MOCK_T24_RECORDS[cleanId]
    if (existing) {
      const matchPhone = normalizeKenyanPhone(existing.phone)
      if (normPhone && normPhone !== matchPhone) {
        return {
          status: 'DETAILS_MISMATCH',
          message: 'The mobile number provided does not match the primary contact number registered with NCBA T24 for this National ID.',
        }
      }
      return {
        status: 'EXISTING_CUSTOMER',
        message: 'NCBA Core Banking record verified. Pre-filling your verified bank profile.',
        customer: existing,
      }
    }

    // Check if whitelisted NTB customer
    if (WHITELISTED_NTB_IDS.has(cleanId) || cleanId.startsWith('30')) {
      return {
        status: 'NEW_TO_BANK',
        message: 'New-to-Bank customer detected. Complete a fast 3-minute NCBA account setup.',
        ntbBannerText:
          'You do not have an active NCBA Account. To activate your KES 5M facility, open an account via NCBA NOW in 3 minutes.',
      }
    }

    // Not whitelisted test hook
    if (cleanId === '99999999') {
      return {
        status: 'NOT_INVITED',
        message:
          'National ID is not currently registered on the BOOSTA pre-approved whitelist. Please verify your invitation SMS or contact your anchor supplier.',
      }
    }

    // Default: treat unknown IDs as New-To-Bank candidate so testers can test smoothly
    return {
      status: 'NEW_TO_BANK',
      message: 'New-to-Bank applicant with anchor pre-qualification.',
      ntbBannerText:
        'You do not have an active NCBA Account. To activate your KES 5M facility, open an account via NCBA NOW in 3 minutes.',
    }
  },

  /**
   * Verifies an NCBA 10-digit account number.
   * Blocks progress until verified.
   */
  async verifyAccount(
    accountNumber: string,
    applicantNationalId?: string
  ): Promise<T24AccountVerifyResult> {
    await new Promise((res) => setTimeout(res, 500))

    const cleanAcc = accountNumber.replace(/\s/g, '').trim()

    // 10 digits check
    if (cleanAcc.length !== 10 || !/^\d+$/.test(cleanAcc)) {
      return {
        status: 'NOT_FOUND',
        message: 'NCBA account number must be exactly 10 digits.',
      }
    }

    // Test hook: Unavailable
    if (cleanAcc === '1000000000') {
      return {
        status: 'UNAVAILABLE',
        message: 'NCBA Core Banking verification service is temporarily undergoing maintenance.',
      }
    }

    // Test hook: Mismatch
    if (cleanAcc === '1099999999') {
      return {
        status: 'MISMATCH',
        message: 'The account ownership record does not match the National ID / Business Registration of this application.',
      }
    }

    // Check existing records
    for (const record of Object.values(MOCK_T24_RECORDS)) {
      const matched = record.accounts.find((a) => a.number === cleanAcc)
      if (matched) {
        if (applicantNationalId && record.nationalId !== applicantNationalId.trim()) {
          return {
            status: 'MISMATCH',
            message: `Account ${cleanAcc} is registered under ${matched.name}, which does not match applicant ID ${applicantNationalId}.`,
          }
        }
        return {
          status: 'SUCCESS',
          message: 'NCBA Account verified successfully and active for settlement.',
          accountName: matched.name,
          accountNumber: matched.number,
          branch: matched.branch,
          currency: matched.currency,
        }
      }
    }

    // Support accounts created during session via NCBA NOW (prefix 1048 or starts with 10)
    if (cleanAcc.startsWith('1048') || cleanAcc.startsWith('1055')) {
      return {
        status: 'SUCCESS',
        message: 'Newly opened NCBA NOW account verified and active for settlement.',
        accountName: 'Kiami Enterprises & Retailers Ltd',
        accountNumber: cleanAcc,
        branch: 'Digital Onboarding Branch',
        currency: 'KES',
      }
    }

    // If starts with 10 and has 10 digits, accept for ease of prototype testing unless explicitly 1011111111 (Not found)
    if (cleanAcc === '1011111111') {
      return {
        status: 'NOT_FOUND',
        message: 'Account number 1011111111 could not be located in NCBA core banking records.',
      }
    }

    return {
      status: 'SUCCESS',
      message: 'NCBA Core Account verified successfully.',
      accountName: 'Kiami Retail & Distribution',
      accountNumber: cleanAcc,
      branch: 'Commercial Center Branch',
      currency: 'KES',
    }
  },
}
