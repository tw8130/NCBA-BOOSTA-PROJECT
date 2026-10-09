import { api } from '../services/api'
import { triggerStkPush } from '../services/mpesa'

async function runPhase4Checkpoint() {
  console.log('=== PHASE 4 CHECKPOINT VERIFICATION START ===\n')

  // 1. Initial State Inspection
  console.log('1. Inspecting initial loan and anchor balances...')
  const initialLoans = await api.getLoans()
  const initialAnchors = await api.getAnchors()
  const loan1 = initialLoans.find((l) => l.id === 'loan-1')
  if (!loan1) throw new Error('loan-1 not found!')

  const initialAnchor = initialAnchors.find((a) => a.id === loan1.anchorId)
  if (!initialAnchor) throw new Error('Anchor for loan-1 not found!')

  const initialBalance = loan1.outstandingBalance
  const initialAvailableLimit = initialAnchor.availableLimit
  const initialTxnCount = (await api.getTransactions()).length
  const initialNotifCount = (await api.getNotifications()).length

  console.log(`   Target Loan: ${loan1.reference} | Balance: KES ${initialBalance.toLocaleString()}`)
  console.log(`   Anchor: ${initialAnchor.name} | Available Limit: KES ${initialAvailableLimit.toLocaleString()}`)
  console.log(`   Initial Transactions: ${initialTxnCount} | Notifications: ${initialNotifCount}`)

  // 2. M-Pesa STK Push Retry Sequence Simulation (Wrong PIN twice then Success)
  console.log('\n2. Testing M-Pesa STK Push state machine (Wrong PIN x2 then Success)...')
  console.log('   Executing STK Attempt 1...')
  const attempt1 = await triggerStkPush(1)
  console.log(`   Attempt 1 Result: ${attempt1}`)
  if (attempt1 !== 'WRONG_PIN') throw new Error(`Expected WRONG_PIN on attempt 1, got ${attempt1}`)

  console.log('   Executing STK Attempt 2 (Retry)...')
  const attempt2 = await triggerStkPush(2)
  console.log(`   Attempt 2 Result: ${attempt2}`)
  if (attempt2 !== 'WRONG_PIN') throw new Error(`Expected WRONG_PIN on attempt 2, got ${attempt2}`)

  console.log('   Executing STK Attempt 3 (Final attempt)...')
  const attempt3 = await triggerStkPush(3)
  console.log(`   Attempt 3 Result: ${attempt3}`)
  if (attempt3 !== 'SUCCESS') throw new Error(`Expected SUCCESS on attempt 3, got ${attempt3}`)

  console.log('   PASSED: STK retry sequence strictly reproduced Wrong PIN twice followed by Success.')

  // 3. Apply Partial Repayment
  const partialRepayAmount = 300_000
  console.log(`\n3. Applying partial repayment of KES ${partialRepayAmount.toLocaleString()} via M-Pesa...`)
  const mpesaRes = await api.applyMpesaRepayment({
    loanId: loan1.id,
    amount: partialRepayAmount,
  })

  console.log(`   Repayment Success: ${mpesaRes.success}`)
  console.log(`   Generated FTX Reference: ${mpesaRes.ftxReference}`)
  console.log(`   Reported New Balance: KES ${mpesaRes.newBalance.toLocaleString()}`)

  if (!mpesaRes.ftxReference || !mpesaRes.ftxReference.startsWith('FTX-')) {
    throw new Error(`Invalid FTX reference generated: ${mpesaRes.ftxReference}`)
  }
  if (mpesaRes.newBalance !== initialBalance - partialRepayAmount) {
    throw new Error(`Expected new balance ${initialBalance - partialRepayAmount}, got ${mpesaRes.newBalance}`)
  }

  // 4. Verify Ledger Reconciliations
  console.log('\n4. Verifying synchronized ledger updates across Loan, Anchor, Transactions & Notifications...')
  const updatedLoans = await api.getLoans()
  const updatedAnchors = await api.getAnchors()
  const updatedTxns = await api.getTransactions()
  const updatedNotifs = await api.getNotifications()

  const refreshedLoan1 = updatedLoans.find((l) => l.id === loan1.id)!
  const refreshedAnchor = updatedAnchors.find((a) => a.id === loan1.anchorId)!

  console.log(`   Loan Balance: KES ${refreshedLoan1.outstandingBalance.toLocaleString()} (Expected: KES ${(initialBalance - partialRepayAmount).toLocaleString()})`)
  if (refreshedLoan1.outstandingBalance !== initialBalance - partialRepayAmount) {
    throw new Error('Loan outstanding balance did not update correctly!')
  }

  console.log(`   Anchor Available Limit: KES ${refreshedAnchor.availableLimit.toLocaleString()} (Expected: KES ${(initialAvailableLimit + partialRepayAmount).toLocaleString()})`)
  if (refreshedAnchor.availableLimit !== initialAvailableLimit + partialRepayAmount) {
    throw new Error('Anchor available limit did not increase by repayment amount!')
  }

  // Verify Transaction record
  const latestTxn = updatedTxns[0]
  console.log(`   Latest Transaction: [${latestTxn.type}] KES ${latestTxn.amount.toLocaleString()} | Ref: ${latestTxn.reference} | FTX: ${latestTxn.ftxReference}`)
  if (latestTxn.type !== 'PARTIAL_REPAYMENT' || latestTxn.amount !== partialRepayAmount) {
    throw new Error('Transaction record mismatch for partial repayment!')
  }
  if (latestTxn.ftxReference !== mpesaRes.ftxReference) {
    throw new Error('Transaction ftxReference does not match repayment response!')
  }

  // Verify Notification record
  const latestNotif = updatedNotifs[0]
  console.log(`   Latest Notification: [${latestNotif.type}] ${latestNotif.title} - ${latestNotif.body}`)
  if (latestNotif.type !== 'PARTIAL_REPAYMENT' || !latestNotif.body.includes(mpesaRes.ftxReference)) {
    throw new Error('Notification record mismatch or missing FTX reference!')
  }

  console.log('   PASSED: Partial repayment reconciled consistently across all ledger domains.')

  // 5. Full Payoff Settlement via NCBA Account
  const remainingBalance = refreshedLoan1.outstandingBalance
  console.log(`\n5. Settling remaining balance of KES ${remainingBalance.toLocaleString()} in full via NCBA Account Debit...`)
  const ncbaRes = await api.repayFromNcbaAccount({
    loanId: loan1.id,
    amount: remainingBalance,
  })

  console.log(`   Full Payoff FTX Reference: ${ncbaRes.ftxReference}`)
  const finalLoans = await api.getLoans()
  const finalLoan1 = finalLoans.find((l) => l.id === loan1.id)!

  console.log(`   Final Loan Status: ${finalLoan1.status} | Outstanding: KES ${finalLoan1.outstandingBalance}`)
  if (finalLoan1.status !== 'PAID' || finalLoan1.outstandingBalance !== 0) {
    throw new Error(`Expected loan to be PAID with 0 balance, got status: ${finalLoan1.status}, balance: ${finalLoan1.outstandingBalance}`)
  }

  const finalNotifs = await api.getNotifications()
  const fullPayoffNotif = finalNotifs[0]
  console.log(`   Full Payoff Notification: [${fullPayoffNotif.type}] ${fullPayoffNotif.title}`)
  if (fullPayoffNotif.type !== 'REPAYMENT_SUCCESS') {
    throw new Error(`Expected REPAYMENT_SUCCESS notification, got ${fullPayoffNotif.type}`)
  }

  console.log('   PASSED: Full repayment changed loan status to PAID and posted REPAYMENT_SUCCESS notification.')

  // 6. Test Per-Loan 3-Day Reminders
  console.log('\n6. Testing per-loan 3-day maturity reminders...')
  const simulatedReminder = await api.simulateThreeDayReminder('loan-2')
  console.log(`   Simulated 3-Day Reminder: [${simulatedReminder.type}] ${simulatedReminder.title}`)
  console.log(`   Body: ${simulatedReminder.body}`)
  if (simulatedReminder.type !== 'DUE_SOON' || !simulatedReminder.body.includes('loan-2') && !simulatedReminder.body.includes('BOO-L-1002')) {
    throw new Error('Simulated reminder failed to create expected DUE_SOON notification!')
  }

  console.log('   PASSED: 3-day maturity reminder successfully generated with SMS and in-app content.')

  console.log('\n=== ALL PHASE 4 CHECKPOINT VERIFICATIONS PASSED SUCCESSFULLY ===')
}

runPhase4Checkpoint().catch((err) => {
  console.error('\n❌ CHECKPOINT FAILED:', err)
  throw err
})
