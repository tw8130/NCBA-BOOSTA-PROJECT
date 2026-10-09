import { calculateDrawdownBreakdown, runCalculationTests } from './calculations'

// Quick assertion helper for test runs
export function testCalculations() {
  const result = runCalculationTests()
  if (!result.passed) {
    throw new Error(`Calculation tests failed:\n${result.results.join('\n')}`)
  }
  return result
}

// Tenor variations test
export function testTenorVariations() {
  const principal = 250_000
  const tenors = [7, 14, 30, 60, 90] as const
  const results = tenors.map((t) => {
    const calc = calculateDrawdownBreakdown({ principal, tenorDays: t, facilityFeePct: 2.5 })
    return {
      tenor: t,
      interest: calc.interest,
      totalRepayable: calc.totalRepayable,
    }
  })

  // Verify interest scales monotonically with tenor
  for (let i = 1; i < results.length; i++) {
    if (results[i].interest <= results[i - 1].interest) {
      throw new Error(`Interest did not increase with tenor: ${results[i - 1].interest} vs ${results[i].interest}`)
    }
  }

  return results
}
