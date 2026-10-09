// -----------------------------------------------------------------------------
// NCBA BOOSTA — Financial Calculations Engine (v2)
//
// Computes loan pricing, statutory charges, anchor disbursements, and
// repayment schedules per the NCBA Retail Innovation credit policies.
//
// Rules:
//  - Base rate: 13.0% (CBK central rate / NCBA base lending rate)
//  - Margin: 4.1% p.a. (Annualized combined interest rate = 17.1%)
//  - Pro-rated interest: principal * (annualRate / 100) * (tenorDays / 365)
//  - Facility fee: 0.5%–4.0% per drawdown (anchor-specific, default 2.5%)
//  - Credit life insurance: 0.011% of principal
//  - Excise duty: 20% on fees (Kenyan statutory tax on financial service fees)
//  - Disbursed to anchor collection account: Principal amount (or net)
//  - Total repayable: Principal + Facility fee + Interest + Insurance + Excise
//  - All frontend quotes carry: "Indicative — prototype"
// -----------------------------------------------------------------------------

export interface CalculationInput {
  principal: number
  tenorDays: number
  facilityFeePct?: number
  baseRatePct?: number
  marginPct?: number
  insuranceRatePct?: number
  exciseTaxRatePct?: number
  disbursementDate?: Date
}

export interface CalculationBreakdown {
  principal: number
  tenorDays: number
  facilityFeePct: number
  facilityFee: number
  annualRatePct: number
  interest: number
  insurance: number
  exciseDuty: number
  totalCharges: number
  disbursedToAnchor: number
  totalRepayable: number
  dueDate: string
  dueDateFormatted: string
  disclaimer: string
}

export const DEFAULT_BASE_RATE_PCT = 13.0
export const DEFAULT_MARGIN_PCT = 4.1
export const DEFAULT_FACILITY_FEE_PCT = 2.5
export const DEFAULT_INSURANCE_RATE_PCT = 0.011 // 0.011% of principal
export const DEFAULT_EXCISE_TAX_RATE_PCT = 20.0 // 20% on fees

export function calculateDrawdownBreakdown(input: CalculationInput): CalculationBreakdown {
  const principal = Math.max(0, input.principal || 0)
  const tenorDays = Math.max(1, input.tenorDays || 30)
  const facilityFeePct = input.facilityFeePct ?? DEFAULT_FACILITY_FEE_PCT
  const baseRatePct = input.baseRatePct ?? DEFAULT_BASE_RATE_PCT
  const marginPct = input.marginPct ?? DEFAULT_MARGIN_PCT
  const insuranceRatePct = input.insuranceRatePct ?? DEFAULT_INSURANCE_RATE_PCT
  const exciseTaxRatePct = input.exciseTaxRatePct ?? DEFAULT_EXCISE_TAX_RATE_PCT

  // 1. Facility / processing fee
  const facilityFee = Math.round(principal * (facilityFeePct / 100))

  // 2. Pro-rated interest (Base + Margin pro-rated by tenor / 365)
  const annualRatePct = baseRatePct + marginPct
  const rawInterest = principal * (annualRatePct / 100) * (tenorDays / 365)
  const interest = Math.round(rawInterest)

  // 3. Credit life insurance (0.011% of principal)
  const rawInsurance = principal * (insuranceRatePct / 100)
  const insurance = Math.round(rawInsurance)

  // 4. Excise duty (20% on facility fees)
  const rawExcise = facilityFee * (exciseTaxRatePct / 100)
  const exciseDuty = Math.round(rawExcise)

  // 5. Aggregate charges
  const totalCharges = facilityFee + interest + insurance + exciseDuty

  // 6. Anchor disbursement: Principal goes to anchor collection account
  const disbursedToAnchor = principal

  // 7. Total repayable by customer
  const totalRepayable = principal + totalCharges

  // 8. Due date calculation
  const start = input.disbursementDate ? new Date(input.disbursementDate) : new Date()
  const due = new Date(start.getTime() + tenorDays * 86_400_000)
  const dueDate = due.toISOString().slice(0, 10)
  const dueDateFormatted = due.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return {
    principal,
    tenorDays,
    facilityFeePct,
    facilityFee,
    annualRatePct,
    interest,
    insurance,
    exciseDuty,
    totalCharges,
    disbursedToAnchor,
    totalRepayable,
    dueDate,
    dueDateFormatted,
    disclaimer: 'Indicative — prototype calculation. Official rates subject to NCBA credit policy.',
  }
}

/**
 * Self-verification test suite verifying formula accuracy, edge cases, and consistency.
 */
export function runCalculationTests(): { passed: boolean; results: string[] } {
  const logs: string[] = []
  let allPassed = true

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      allPassed = false
      logs.push(`FAIL: ${msg}`)
    } else {
      logs.push(`PASS: ${msg}`)
    }
  }

  // Test 1: Zero principal
  const zeroRes = calculateDrawdownBreakdown({ principal: 0, tenorDays: 30 })
  assert(zeroRes.principal === 0 && zeroRes.totalCharges === 0 && zeroRes.totalRepayable === 0, 'Zero principal returns zero charges')

  // Test 2: Standard 100,000 KES 30-day facility with 2.5% fee
  const stdRes = calculateDrawdownBreakdown({
    principal: 100_000,
    tenorDays: 30,
    facilityFeePct: 2.5,
    baseRatePct: 13.0,
    marginPct: 4.1,
  })
  assert(stdRes.facilityFee === 2_500, `Facility fee 2.5% on 100k is 2,500 (got ${stdRes.facilityFee})`)
  assert(stdRes.exciseDuty === 500, `Excise duty 20% on 2,500 is 500 (got ${stdRes.exciseDuty})`)
  assert(stdRes.annualRatePct === 17.1, `Annual rate is 17.1% (got ${stdRes.annualRatePct})`)
  assert(stdRes.interest === 1_405, `Interest on 100k for 30d @ 17.1% is 1,405 (got ${stdRes.interest})`)
  assert(stdRes.insurance === 11, `Insurance 0.011% on 100k is 11 (got ${stdRes.insurance})`)
  assert(stdRes.totalRepayable === 104_416, `Total repayable is 104,416 (got ${stdRes.totalRepayable})`)
  assert(stdRes.disbursedToAnchor === 100_000, `Net to anchor is 100,000 (got ${stdRes.disbursedToAnchor})`)

  // Test 3: Anchor-specific fee (e.g. 3.5% on 500,000 KES, 60 days)
  const anchorRes = calculateDrawdownBreakdown({
    principal: 500_000,
    tenorDays: 60,
    facilityFeePct: 3.5,
  })
  assert(anchorRes.facilityFee === 17_500, `Facility fee 3.5% on 500k is 17,500 (got ${anchorRes.facilityFee})`)
  assert(anchorRes.exciseDuty === 3_500, `Excise 20% on 17,500 is 3,500 (got ${anchorRes.exciseDuty})`)
  assert(anchorRes.totalRepayable === anchorRes.principal + anchorRes.totalCharges, 'Total repayable strictly equals principal + total charges')

  return { passed: allPassed, results: logs }
}
