// -----------------------------------------------------------------------------
// NCBA BOOSTA — Onboarding Gateway API
// -----------------------------------------------------------------------------

import { DEMO_EXPIRED_OTP, DEMO_OTP } from '../lib/validators'
import type { Anchor, CustomerProfile } from '../types'
import { mockAnchors } from '../mocks/data'

export interface OtpVerificationResult {
  success: boolean
  message: string
  codeStatus: 'VALID' | 'INVALID' | 'EXPIRED' | 'LOCKED'
  remainingAttempts?: number
}

export interface EligibleAnchor {
  id: string
  name: string
  logoInitial: string
  category: string
  indicativeLimit: number
  tier: 'TIER_1' | 'TIER_2'
  maxTenorDays: number
  annualTurnoverKes: number
}

export const onboardingApi = {
  /**
   * Simulates sending an SMS OTP to customer phone
   */
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    await new Promise((res) => setTimeout(res, 400))
    return {
      success: true,
      message: `A 6-digit verification code has been sent via SMS to ${phone}. Valid for 5 minutes.`,
    }
  },

  /**
   * Verifies an OTP code
   */
  async verifyOtp(
    _phone: string,
    code: string,
    failedAttemptsCount = 0
  ): Promise<OtpVerificationResult> {
    await new Promise((res) => setTimeout(res, 450))

    if (failedAttemptsCount >= 3) {
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.',
        codeStatus: 'LOCKED',
        remainingAttempts: 0,
      }
    }

    if (code === DEMO_EXPIRED_OTP) {
      return {
        success: false,
        message: 'This verification code has expired. Please tap Resend Code to receive a new OTP.',
        codeStatus: 'EXPIRED',
      }
    }

    if (code === DEMO_OTP) {
      return {
        success: true,
        message: 'Mobile number verified successfully.',
        codeStatus: 'VALID',
      }
    }

    const remaining = Math.max(0, 3 - (failedAttemptsCount + 1))
    return {
      success: false,
      message: `Invalid verification code. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      codeStatus: 'INVALID',
      remainingAttempts: remaining,
    }
  },

  /**
   * Simulates instant account opening via NCBA NOW
   */
  async openNcbaNowAccount(payload: {
    fullName: string
    nationalId: string
    phone: string
    businessName?: string
  }): Promise<{
    accountNumber: string
    accountName: string
    cif: string
    branch: string
  }> {
    await new Promise((res) => setTimeout(res, 800))
    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const accountNumber = `1048${randomSuffix}`

    return {
      accountNumber,
      accountName: payload.businessName || `${payload.fullName} Enterprise`,
      cif: `CIF-NTB-${randomSuffix}`,
      branch: 'Digital Onboarding Branch',
    }
  },

  /**
   * Returns backend-provided eligible anchors for the applicant
   */
  async getEligibleAnchors(): Promise<EligibleAnchor[]> {
    await new Promise((res) => setTimeout(res, 350))
    return [
      {
        id: 'anchor-eabl',
        name: 'East African Breweries PLC (EABL)',
        logoInitial: 'EA',
        category: 'Beverages & FMCG',
        indicativeLimit: 2500000,
        tier: 'TIER_1',
        maxTenorDays: 60,
        annualTurnoverKes: 18400000,
      },
      {
        id: 'anchor-coke',
        name: 'Coca-Cola Beverages Africa (CCBA)',
        logoInitial: 'CC',
        category: 'Soft Drinks & FMCG',
        indicativeLimit: 1500000,
        tier: 'TIER_1',
        maxTenorDays: 30,
        annualTurnoverKes: 12200000,
      },
      {
        id: 'anchor-ncba',
        name: 'Bata Shoe Company Kenya PLC',
        logoInitial: 'BA',
        category: 'Footwear & Retail',
        indicativeLimit: 1000000,
        tier: 'TIER_2',
        maxTenorDays: 90,
        annualTurnoverKes: 8900000,
      },
      {
        id: 'anchor-devki',
        name: 'Devki Steel Mills & Cement',
        logoInitial: 'DS',
        category: 'Construction & Hardware',
        indicativeLimit: 1200000,
        tier: 'TIER_2',
        maxTenorDays: 60,
        annualTurnoverKes: 9500000,
      },
    ]
  },

  /**
   * Submits complete onboarding application to NCBA BOOSTA backend
   */
  async submitOnboardingApplication(profile: Partial<CustomerProfile>): Promise<{
    success: boolean
    message: string
    customerId: string
  }> {
    await new Promise((res) => setTimeout(res, 750))
    return {
      success: true,
      message: 'Onboarding complete! Your NCBA BOOSTA facility is now active.',
      customerId: profile.id || 'cust-new-1',
    }
  },
}
