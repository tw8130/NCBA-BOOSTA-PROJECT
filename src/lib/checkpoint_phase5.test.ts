import { anchorApi } from '../services/anchorApi'
import { mockAnchorCustomers } from '../mocks/data'
import type { TurnoverReviewStatus } from '../types'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

async function runCheckpointPhase5() {
  console.log('🧪 Starting Phase 5 Checkpoint Tests...')

  // 1. Portfolio Table Search & Pagination Tests
  console.log('Test 1: Retailer portfolio data, search, and pagination...')
  const customers = await anchorApi.getCustomers()
  assert(customers.length === 10, `Expected 10 mock customers, got ${customers.length}`)

  // Search by name
  const nameQuery = 'Kiptoo'
  const foundByName = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(nameQuery.toLowerCase()) ||
      c.nationalId.toLowerCase().includes(nameQuery.toLowerCase())
  )
  assert(foundByName.length === 1, `Expected 1 result for search "${nameQuery}", got ${foundByName.length}`)
  assert(foundByName[0].name.includes('Kiptoo'), 'Found customer should match name query')

  // Search by National ID
  const idQuery = '29810442'
  const foundById = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(idQuery.toLowerCase()) ||
      c.nationalId.toLowerCase().includes(idQuery.toLowerCase())
  )
  assert(foundById.length === 1, `Expected 1 result for search "${idQuery}", got ${foundById.length}`)
  assert(foundById[0].nationalId === '29810442', 'Found customer should match national ID')

  // Pagination (pageSize = 5)
  const pageSize = 5
  const totalPages = Math.ceil(customers.length / pageSize)
  assert(totalPages === 2, `Expected 2 pages for 10 items at 5 per page, got ${totalPages}`)

  const page1 = customers.slice(0, pageSize)
  const page2 = customers.slice(pageSize, pageSize * 2)
  assert(page1.length === 5, `Page 1 should have 5 items, got ${page1.length}`)
  assert(page2.length === 5, `Page 2 should have 5 items, got ${page2.length}`)
  assert(page1[0].customerId !== page2[0].customerId, 'Page 1 and Page 2 should have different items')

  // Overdue Ageing verification
  const overdueCustomers = customers.filter((c) => c.overdueAgeing !== 'Current')
  assert(overdueCustomers.length > 0, 'Should have at least 1 customer with overdue aging bracket')
  for (const c of overdueCustomers) {
    assert(
      ['1-30 DPD', '31-60 DPD', '61-90 DPD', '90+ DPD'].includes(c.overdueAgeing),
      `Customer ${c.name} should have valid aging bracket, got ${c.overdueAgeing}`
    )
    assert((c.daysOverdue ?? 0) > 0, `Customer ${c.name} should have daysOverdue > 0`)
  }
  console.log('✅ Test 1 Passed: Search, pagination, and aging fields verified.')

  // 2. Turnover Review State Machine Lifecycle
  console.log('Test 2: Annual turnover review state machine transitions...')
  
  // Reset to initial DUE_SOON state
  let tr = await anchorApi.setTurnoverReviewStatus('DUE_SOON')
  assert(tr.status === 'DUE_SOON', `Expected status DUE_SOON, got ${tr.status}`)

  // Transition: DUE_SOON -> DOCUMENTS_UPLOADED
  tr = await anchorApi.setTurnoverReviewStatus('DOCUMENTS_UPLOADED', {
    documents: ['Audited Financials', 'KRA TCC', 'Turnover Cert', 'Board Resolution'],
  })
  assert(tr.status === 'DOCUMENTS_UPLOADED', `Expected status DOCUMENTS_UPLOADED, got ${tr.status}`)
  assert(tr.documents?.length === 4, `Expected 4 documents uploaded, got ${tr.documents?.length}`)

  // Transition: DOCUMENTS_UPLOADED -> SUBMITTED
  tr = await anchorApi.setTurnoverReviewStatus('SUBMITTED')
  assert(tr.status === 'SUBMITTED', `Expected status SUBMITTED, got ${tr.status}`)
  assert(Boolean(tr.submittedAt), 'SubmittedAt should be stamped')

  // Transition: SUBMITTED -> UNDER_NCBA_REVIEW
  tr = await anchorApi.setTurnoverReviewStatus('UNDER_NCBA_REVIEW')
  assert(tr.status === 'UNDER_NCBA_REVIEW', `Expected status UNDER_NCBA_REVIEW, got ${tr.status}`)

  // Transition: UNDER_NCBA_REVIEW -> MORE_INFO_REQUIRED
  tr = await anchorApi.setTurnoverReviewStatus('MORE_INFO_REQUIRED', {
    reviewerComments: 'Please upload FY26 Q3 VAT returns to clarify gross turnover.',
  })
  assert(tr.status === 'MORE_INFO_REQUIRED', `Expected status MORE_INFO_REQUIRED, got ${tr.status}`)
  assert(
    tr.reviewerComments?.includes('VAT returns') ?? false,
    'Reviewer comments should be saved'
  )

  // Re-submission after rework: MORE_INFO_REQUIRED -> DOCUMENTS_UPLOADED -> SUBMITTED -> UNDER_NCBA_REVIEW -> APPROVED
  tr = await anchorApi.setTurnoverReviewStatus('DOCUMENTS_UPLOADED')
  assert(tr.status === 'DOCUMENTS_UPLOADED', 'Expected status DOCUMENTS_UPLOADED after rework')

  tr = await anchorApi.setTurnoverReviewStatus('SUBMITTED')
  assert(tr.status === 'SUBMITTED', 'Expected status SUBMITTED')

  tr = await anchorApi.setTurnoverReviewStatus('UNDER_NCBA_REVIEW')
  assert(tr.status === 'UNDER_NCBA_REVIEW', 'Expected status UNDER_NCBA_REVIEW')

  tr = await anchorApi.setTurnoverReviewStatus('APPROVED', { newProposedLimit: 15_000_000 })
  assert(tr.status === 'APPROVED', `Expected status APPROVED, got ${tr.status}`)
  assert(tr.newProposedLimit === 15_000_000, 'Expected approved limit to be 15M')

  // Transition to DECLINED verification
  tr = await anchorApi.setTurnoverReviewStatus('DECLINED', {
    reviewerComments: 'Inadequate debt coverage ratio.',
  })
  assert(tr.status === 'DECLINED', `Expected status DECLINED, got ${tr.status}`)
  assert(tr.reviewerComments === 'Inadequate debt coverage ratio.', 'Expected decline comment')

  console.log('✅ Test 2 Passed: Full turnover review state machine lifecycle verified.')

  // 3. Anchor Notifications & Dispatch
  console.log('Test 3: Anchor notifications, category filtering, and state transitions...')
  let notifs = await anchorApi.getNotifications()
  assert(notifs.length > 0, 'Notifications list should not be empty')

  const unreadNotif = notifs.find((n) => n.state === 'unread')
  assert(Boolean(unreadNotif), 'Should have at least one unread notification')

  // Transition unread -> read
  if (unreadNotif) {
    await anchorApi.setNotificationState(unreadNotif.id, 'read')
    notifs = await anchorApi.getNotifications()
    const updated = notifs.find((n) => n.id === unreadNotif.id)
    assert(updated?.state === 'read', 'Notification state should be read')

    // Transition read -> archived
    await anchorApi.setNotificationState(unreadNotif.id, 'archived')
    notifs = await anchorApi.getNotifications()
    const archived = notifs.find((n) => n.id === unreadNotif.id)
    assert(archived?.state === 'archived', 'Notification state should be archived')

    // Unarchive back to read
    await anchorApi.setNotificationState(unreadNotif.id, 'read')
    notifs = await anchorApi.getNotifications()
    const restored = notifs.find((n) => n.id === unreadNotif.id)
    assert(restored?.state === 'read', 'Notification state should be restored to read')
  }

  // Mark all as read
  await anchorApi.markAllNotificationsRead()
  notifs = await anchorApi.getNotifications()
  const unreadCount = notifs.filter((n) => n.state === 'unread').length
  assert(unreadCount === 0, `Expected 0 unread notifications after markAllNotificationsRead, got ${unreadCount}`)

  console.log('✅ Test 3 Passed: Notification lifecycle and actions verified.')

  console.log('🎉 ALL PHASE 5 CHECKPOINTS PASSED SUCCESSFULLY!')
}

runCheckpointPhase5().catch((err) => {
  console.error('❌ Checkpoint Phase 5 Failed:', err)
  throw err
})
