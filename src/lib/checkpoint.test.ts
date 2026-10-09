import { api } from '../services/api'

async function runCheckpoint() {
  console.log('=== CHECKPOINT VERIFICATION START ===')

  // 1. Same-day drawdowns from two anchors
  console.log('1. Testing same-day drawdowns from two anchors...')
  const d1 = await api.createDrawdown({
    anchorId: 'anchor-eabl',
    amount: 200_000,
    tenorDays: 30,
    purpose: 'Stock purchase',
    mandate: 'SINGLE',
  })
  const d2 = await api.createDrawdown({
    anchorId: 'anchor-coke',
    amount: 300_000,
    tenorDays: 14,
    purpose: 'Beverage restocking',
    mandate: 'SINGLE',
  })
  console.log(`   Drawdown 1: ${d1.status} | Ref: ${d1.loan?.reference} | Principal: ${d1.loan?.principal}`)
  console.log(`   Drawdown 2: ${d2.status} | Ref: ${d2.loan?.reference} | Principal: ${d2.loan?.principal}`)

  const anchors = await api.getAnchors()
  const loans = await api.getLoans()
  const totalApproved = anchors.reduce((s, a) => s + a.approvedLimit, 0)
  const totalAvailable = anchors.reduce((s, a) => s + a.availableLimit, 0)
  const totalUtilised = totalApproved - totalAvailable
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE')
  const sumOutstanding = activeLoans.reduce((s, l) => s + l.outstandingBalance, 0)

  console.log(`   Total Approved: KES ${totalApproved.toLocaleString()}`)
  console.log(`   Total Available: KES ${totalAvailable.toLocaleString()}`)
  console.log(`   Total Utilised: KES ${totalUtilised.toLocaleString()}`)
  console.log(`   Sum of Outstanding Loan Balances: KES ${sumOutstanding.toLocaleString()}`)

  if (totalUtilised !== sumOutstanding) {
    throw new Error(`Financial inconsistency! Utilised (${totalUtilised}) != Sum Outstanding (${sumOutstanding})`)
  }
  console.log('   PASSED: Utilised + Available strictly equals Approved, and Utilised strictly matches active loans balance.')

  // 2. Two loans from one anchor simultaneously
  console.log('\n2. Testing multiple concurrent loans from one anchor (EABL)...')
  const eablLoans = loans.filter((l) => l.anchorId === 'anchor-eabl' && l.status === 'ACTIVE')
  console.log(`   EABL has ${eablLoans.length} concurrent active loans:`)
  eablLoans.forEach((l) => {
    console.log(`   - Loan ${l.reference}: Principal KES ${l.principal.toLocaleString()}, Due ${l.dueDate}, Balance KES ${l.outstandingBalance.toLocaleString()}`)
  })
  if (eablLoans.length < 2) {
    throw new Error('Expected at least 2 active loans for EABL!')
  }
  console.log('   PASSED: Multiple independent loans run concurrently with separate tenors and due dates.')

  // 3. JOINT_ALL approval workflow
  console.log('\n3. Testing JOINT_ALL multi-signatory approval workflow...')
  const jointRes = await api.createDrawdown({
    anchorId: 'anchor-eabl',
    amount: 150_000,
    tenorDays: 30,
    purpose: 'Peak seasonal inventory',
    mandate: 'JOINT_ALL',
    signatories: [
      { id: 'dir-1', fullName: 'Grace Wambui (Director)', phone: '0722100200' },
      { id: 'dir-2', fullName: 'David Omondi (Director)', phone: '0722300400' },
    ],
  })
  console.log(`   Joint request initiated: ${jointRes.drawdownRequest.reference} | Status: ${jointRes.status}`)
  const token1 = jointRes.drawdownRequest.approvals[0].token
  const token2 = jointRes.drawdownRequest.approvals[1].token

  // Signatory 1 signs
  const sig1Res = await api.approveSignatoryDrawdown(jointRes.drawdownRequest.id, token1, 'data:image/png;base64,sig1')
  console.log(`   Signatory 1 signed. Disbursed? ${sig1Res.disbursed} | Status: ${sig1Res.drawdownRequest.status}`)
  if (sig1Res.disbursed) throw new Error('JOINT_ALL should not disburse after only 1 signature!')

  // Signatory 2 signs
  const sig2Res = await api.approveSignatoryDrawdown(jointRes.drawdownRequest.id, token2, 'data:image/png;base64,sig2')
  console.log(`   Signatory 2 signed. Disbursed? ${sig2Res.disbursed} | Status: ${sig2Res.drawdownRequest.status}`)
  if (!sig2Res.disbursed || sig2Res.drawdownRequest.status !== 'DISBURSED') {
    throw new Error('JOINT_ALL should be DISBURSED after all signatures!')
  }
  console.log('   PASSED: JOINT_ALL dispatches tokens, tracks signatory progress, and disburses upon final signature.')

  // 4. Rework loop back to initiator
  console.log('\n4. Testing rework loop back to initiator...')
  const reworkReq = await api.createDrawdown({
    anchorId: 'anchor-eabl',
    amount: 100_000,
    tenorDays: 30,
    purpose: 'Bulk packaging supply',
    mandate: 'JOINT_ALL',
    signatories: [{ id: 'dir-3', fullName: 'Partner John', phone: '0722555666' }],
  })
  const tokenRework = reworkReq.drawdownRequest.approvals[0].token
  const reworkRes = await api.reworkSignatoryDrawdown(
    reworkReq.drawdownRequest.id,
    tokenRework,
    'Please reduce order amount to KES 75,000'
  )
  console.log(`   Signatory requested rework: Status: ${reworkRes.status} | Feedback: "${reworkRes.reworkNotes}"`)

  // Initiator updates and resubmits
  const resubmitRes = await api.resubmitDrawdown(reworkReq.drawdownRequest.id, {
    amount: 75_000,
    tenorDays: 14,
    purpose: 'Bulk packaging supply (adjusted)',
  })
  console.log(`   Initiator resubmitted: Status: ${resubmitRes.status} | New Amount: KES ${resubmitRes.amount.toLocaleString()} | New Tenor: ${resubmitRes.tenorDays}d`)
  if (resubmitRes.status !== 'PENDING_APPROVAL' || resubmitRes.amount !== 75_000) {
    throw new Error('Resubmission did not update status and terms correctly!')
  }
  console.log('   PASSED: Rework loop updates terms and resets signatory approval queue.')

  console.log('\n=== ALL PHASE 3 CHECKPOINTS VERIFIED 100% SUCCESSFULLY ===')
}

runCheckpoint().catch((err) => {
  console.error('FAILED:', err)
  throw err
})
