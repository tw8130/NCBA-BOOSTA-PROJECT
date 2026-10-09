import { lmsApi } from '../services/lmsApi'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

async function runCheckpointPhase6() {
  console.log('🧪 Starting Phase 6 Checkpoint Tests: LMS Maker-Checker Operations...')

  // 1. LMS Portfolio Health & CBK Classification
  console.log('Test 1: LMS portfolio summary & CBK PAR grades...')
  const summary = await lmsApi.getPortfolioSummary()
  assert(summary.grossPortfolioKes === 142_500_000, `Expected gross portfolio 142.5M, got ${summary.grossPortfolioKes}`)
  assert(summary.collectionsYtdKes === 88_200_000, `Expected collections 88.2M, got ${summary.collectionsYtdKes}`)
  assert(summary.parBreakdown.length === 5, `Expected 5 CBK grades, got ${summary.parBreakdown.length}`)

  const grades = summary.parBreakdown.map((p) => p.grade)
  assert(grades.includes('NORMAL'), 'Missing NORMAL grade')
  assert(grades.includes('WATCH'), 'Missing WATCH grade')
  assert(grades.includes('SUBSTANDARD'), 'Missing SUBSTANDARD grade')
  assert(grades.includes('DOUBTFUL'), 'Missing DOUBTFUL grade')
  assert(grades.includes('LOSS'), 'Missing LOSS grade')

  const totalExposure = summary.parBreakdown.reduce((s, p) => s + p.balanceKes, 0)
  assert(totalExposure === summary.grossPortfolioKes, 'Sum of PAR balances must equal gross portfolio')
  console.log('✅ Test 1 Passed: Portfolio health metrics and CBK asset classifications verified.')

  // 2. Partner Onboarding & Core Account Validation
  console.log('Test 2: Partner creation & T24 core account validation...')
  const invalidAcc = await lmsApi.validateCoreAccount('1234')
  assert(!invalidAcc.valid, 'Account under 10 digits should be invalid')

  const validAcc = await lmsApi.validateCoreAccount('1002938471')
  assert(validAcc.valid, 'Account 1002938471 should be valid')
  assert(Boolean(validAcc.accountName), 'Account name should be returned from T24')

  const newPartner = await lmsApi.createPartner({
    anchorCode: 'TEST-999',
    name: 'Kenya Seed Company',
    coreAccount: '1007829103',
    accountName: 'Kenya Seed Company Commercial Account',
    contactPerson: 'David Kiptum',
    contactPhone: '+254711888999',
    contactEmail: 'david.kiptum@kenyaseed.co.ke',
    facilityLimit: 25_000_000,
    maxTenor: 60,
    baseRate: 13.0,
    margin: 3.0,
    effectiveRate: 16.0,
    allowedTenors: [7, 14, 30, 60],
    disbursementMode: 'DIRECT_SETTLEMENT',
    makerId: 'maker-001',
  })
  assert(newPartner.status === 'ACTIVE', 'Created partner should be active')
  assert(newPartner.effectiveRate === 16.0, 'Effective rate must be 16.0%')
  console.log('✅ Test 2 Passed: Partner onboarding and account verification verified.')

  // 3. Maker-Checker Limit Amendment & Audit Trail
  console.log('Test 3: Maker request creation, Checker queue visibility, Maker≠Checker separation, and audit trail...')
  const customers = await lmsApi.getCustomers()
  const targetCust = customers.find((c) => c.id === 'lms-c-001')
  assert(Boolean(targetCust), 'Customer lms-c-001 not found')

  const initialLimit = targetCust!.limit
  const proposedLimit = initialLimit + 450_000

  // Maker submits request
  const makerReq = await lmsApi.createLimitAmendment({
    customerId: targetCust!.id,
    proposedLimit,
    justification: 'Consistent order expansion and 100% repayment track record over 6 cycles.',
    justificationDocName: 'Credit_Appraisal_Memo_FY26.pdf',
    makerId: 'maker-001',
    makerName: 'Kennedy Ochieng',
  })

  assert(makerReq.status === 'PENDING_CHECKER', `Expected PENDING_CHECKER, got ${makerReq.status}`)
  assert(makerReq.proposedLimit === proposedLimit, 'Proposed limit mismatch')

  // Verify the request appears in Checker queue
  const queue = await lmsApi.getLimitAmendments()
  const foundInQueue = queue.find((q) => q.id === makerReq.id)
  assert(Boolean(foundInQueue), 'Created Maker request must appear in Checker queue')
  assert(foundInQueue!.status === 'PENDING_CHECKER', 'Request in queue must be PENDING_CHECKER')

  // Verify Maker≠Checker Enforcement: Maker cannot approve own submission
  let makerApprovalFailed = false
  try {
    await lmsApi.approveLimitAmendment(
      makerReq.id,
      'maker-001', // SAME as makerId
      'Kennedy Ochieng',
      'Attempting self-approval'
    )
  } catch (err: unknown) {
    makerApprovalFailed = true
    assert(
      (err as Error).message.includes('Maker-Checker Separation of Duties'),
      `Expected separation error, got: ${(err as Error).message}`
    )
  }
  assert(makerApprovalFailed, 'CRITICAL: Maker was able to approve own request! Maker≠Checker violation!')

  // Checker approves request
  const approved = await lmsApi.approveLimitAmendment(
    makerReq.id,
    'checker-001', // Different actor
    'Sylvia Njeri',
    'Approved per Delegated Lending Authority Tier 2.'
  )
  assert(approved.status === 'APPROVED', `Expected status APPROVED, got ${approved.status}`)
  assert(approved.checkerId === 'checker-001', 'Checker ID must be stamped')

  // Customer limit must be updated in LMS core
  const updatedCustomers = await lmsApi.getCustomers()
  const updatedCust = updatedCustomers.find((c) => c.id === targetCust!.id)
  assert(
    updatedCust!.limit === proposedLimit,
    `Customer limit should be updated to ${proposedLimit}, got ${updatedCust!.limit}`
  )

  // Audit trail must contain complete immutable history
  const auditEntries = await lmsApi.getAuditTrail(makerReq.id)
  assert(auditEntries.length >= 3, `Expected at least 3 audit entries for request, got ${auditEntries.length}`)

  const actions = auditEntries.map((a) => a.action)
  assert(actions.includes('CREATED'), 'Audit trail missing CREATED entry')
  assert(actions.includes('SUBMITTED'), 'Audit trail missing SUBMITTED entry')
  assert(actions.includes('APPROVED'), 'Audit trail missing APPROVED entry')

  const approveEntry = auditEntries.find((a) => a.action === 'APPROVED')
  assert(approveEntry!.actorRole === 'BANK_CHECKER', 'Approve entry must be authored by BANK_CHECKER')
  assert(approveEntry!.details.includes('Sylvia Njeri'), 'Approve entry must cite checker name')
  console.log('✅ Test 3 Passed: Maker request appeared in Checker queue, Maker≠Checker enforced, customer limit updated, and audit trail stamped.')

  // 4. T24 General Ledger Accounting Mirror & Zero Vendor Names Rule
  console.log('Test 4: T24 GL mirror balance and zero vendor names assertion...')
  const glEntries = await lmsApi.getGlEntries()
  assert(glEntries.length >= 10, `Expected at least 10 GL entries, got ${glEntries.length}`)

  const totalDebits = glEntries.reduce((s, e) => s + e.debit, 0)
  const totalCredits = glEntries.reduce((s, e) => s + e.credit, 0)
  assert(totalDebits === totalCredits, `GL entries must be balanced! Debits: ${totalDebits}, Credits: ${totalCredits}`)

  // Verify core GL codes exist
  const glCodes = glEntries.map((e) => e.glCode)
  assert(glCodes.includes('14101'), 'Missing Principal Loan Asset GL 14101')
  assert(glCodes.includes('51002'), 'Missing Interest Income GL 51002')
  assert(glCodes.includes('51009'), 'Missing Penalty Interest GL 51009')
  assert(glCodes.includes('52001'), 'Missing Facility Fee GL 52001')
  assert(glCodes.includes('21099'), 'Missing BOOSTA Control Account GL 21099')

  // ZERO VENDOR NAMES CHECK
  const serialized = JSON.stringify(glEntries).toLowerCase()
  assert(!serialized.includes('pezesha'), 'CRITICAL VIOLATION: Former vendor name Pezesha found in GL mirror!')
  assert(!serialized.includes('patascore'), 'CRITICAL VIOLATION: Former vendor name Patascore found in GL mirror!')
  console.log('✅ Test 4 Passed: T24 GL mirror in balance with zero vendor names.')

  // 5. Gateway Reconciliation Exceptions
  console.log('Test 5: Gateway exceptions reconciliation...')
  const exceptions = await lmsApi.getExceptions()
  assert(exceptions.length > 0, 'Exceptions list should not be empty')

  const openExc = exceptions.find((e) => e.status === 'UNMATCHED')
  assert(Boolean(openExc), 'Should have at least 1 unmatched exception')

  const resolved = await lmsApi.resolveException(openExc!.id, 'Verified against Safaricom Daraja API portal.')
  assert(resolved.status === 'MANUAL_OVERRIDE', `Expected MANUAL_OVERRIDE, got ${resolved.status}`)
  console.log('✅ Test 5 Passed: Gateway exception manually resolved with audit note.')

  console.log('🎉 ALL PHASE 6 CHECKPOINTS PASSED SUCCESSFULLY!')
}

runCheckpointPhase6().catch((err) => {
  console.error('❌ Checkpoint Phase 6 Failed:', err)
  throw err
})
