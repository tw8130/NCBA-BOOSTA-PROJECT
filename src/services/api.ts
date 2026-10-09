// -----------------------------------------------------------------------------
// Mock NCBA BOOSTA customer-side API layer
//
// This is a PROTOTYPE contract, not a final bank API. Every function here
// returns a Promise, exactly like a real fetch() call would, so that when
// the real NCBA BOOSTA backend is ready, this file (and anchorApi.ts) is the
// ONLY thing that needs to change — no component or page should need to
// change shape.
//
// The frontend never talks to T24, CRB, or the scorecard directly. It only
// ever calls functions like these, standing in for endpoints such as:
//   GET  /customer/profile          GET  /customer/anchors
//   GET  /customer/loans            GET  /applications
//   POST /applications              POST /repayments
//   POST /repayments/mpesa          GET  /notifications
// -----------------------------------------------------------------------------

import type {
  Anchor,
  AppNotification,
  Customer,
  DeclineReasonCode,
  DrawdownRequest,
  Loan,
  LoanApplication,
  LoanTenorDays,
  MandateType,
  ScorecardDecision,
  Signatory,
  Transaction,
} from '../types'
import {
  mockAnchors,
  mockApplications,
  mockCustomer,
  mockLoans,
  mockNotifications,
  mockTransactions,
} from '../mocks/data'
import { calculateDrawdownBreakdown } from '../lib/calculations'

const LATENCY = 400

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const samplePendingDrawdown: DrawdownRequest = {
  id: 'dd-req-001',
  reference: 'BOO-DR-1001',
  anchorId: 'anchor-eabl',
  amount: 450_000,
  tenorDays: 30,
  purpose: 'Seasonal restocking',
  status: 'PENDING_APPROVAL',
  initiatedBy: 'Bonface Macharia',
  mandateType: 'JOINT_ALL',
  approvals: [
    {
      signatoryId: 'sig-1',
      signatoryName: 'Grace Wambui (Director)',
      token: 'token-demo-director-1',
      status: 'PENDING',
    },
    {
      signatoryId: 'sig-2',
      signatoryName: 'David Omondi (Director)',
      token: 'token-demo-director-2',
      status: 'PENDING',
    },
  ],
  tokenExpiresAt: new Date(Date.now() + 86_400_000 * 3).toISOString(),
  createdAt: new Date().toISOString(),
}

// In-memory mutable store standing in for a real backend during the prototype.
// A page refresh resets it — that's expected for a demo.
const store = {
  customer: { ...mockCustomer },
  anchors: mockAnchors.map((a) => ({ ...a })),
  loans: mockLoans.map((l) => ({ ...l })),
  applications: mockApplications.map((a) => ({ ...a })),
  transactions: mockTransactions.map((t) => ({ ...t })),
  notifications: mockNotifications.map((n) => ({ ...n })),
  drawdownRequests: [samplePendingDrawdown] as DrawdownRequest[],
}

let applicationSeq = store.applications.length + 1
let loanSeq = store.loans.length + 1
let transactionSeq = store.transactions.length + 1
let drawdownSeq = store.drawdownRequests.length + 1

export const api = {
  async getProfile(): Promise<Customer> {
    return delay(store.customer)
  },

  async getAnchors(): Promise<Anchor[]> {
    return delay(store.anchors)
  },

  async getAnchor(anchorId: string): Promise<Anchor | undefined> {
    return delay(store.anchors.find((a) => a.id === anchorId))
  },

  async getLoans(): Promise<Loan[]> {
    return delay(store.loans)
  },

  async getLoansByAnchor(anchorId: string): Promise<Loan[]> {
    return delay(store.loans.filter((l) => l.anchorId === anchorId))
  },

  async getApplications(): Promise<LoanApplication[]> {
    return delay([...store.applications].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)))
  },

  async getApplication(id: string): Promise<LoanApplication | undefined> {
    return delay(store.applications.find((a) => a.id === id))
  },

  async getTransactions(): Promise<Transaction[]> {
    return delay([...store.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)))
  },

  async getNotifications(): Promise<AppNotification[]> {
    checkAndGenerateLoanReminders()
    return delay(store.notifications)
  },

  async markNotificationRead(id: string): Promise<void> {
    const n = store.notifications.find((x) => x.id === id)
    if (n) n.read = true
    return delay(undefined, 150)
  },

  async markAllNotificationsRead(): Promise<void> {
    store.notifications.forEach((n) => {
      n.read = true
    })
    return delay(undefined, 150)
  },

  // creditDecisionService — mirrors what the real NCBA Scorecard / Credit
  // Decision service would return. The frontend NEVER computes this itself.
  async getScorecardDecision(): Promise<ScorecardDecision> {
    const restricted = store.anchors.some((a) => !a.drawdownAllowed)
    return delay({
      customerId: store.customer.id,
      status: 'ELIGIBLE',
      limit: store.anchors.reduce((s, a) => s + a.approvedLimit, 0),
      crbStatus: restricted ? 'REVIEW_REQUIRED' : 'CLEAR',
      drawdownAllowed: !restricted,
      anchors: store.anchors.map((a) => ({ anchorId: a.id, approvedLimit: a.approvedLimit })),
    })
  },

  // loanService — POST /applications
  // A customer may hold several concurrent loans against the SAME anchor —
  // each drawdown is its own record with its own due date. The only gates
  // are: enough available limit, and drawdown allowed (no CRB issue).
  async submitApplication(input: {
    anchorId: string
    amount: number
    tenorDays: number
    purpose: string
  }): Promise<LoanApplication> {
    const anchor = store.anchors.find((a) => a.id === input.anchorId)!

    const processingFee = Math.round(input.amount * 0.035)
    const interest = Math.round(input.amount * 0.0038 * (input.tenorDays / 7))
    const insurance = Math.round(input.amount * 0.00011)
    const exciseDuty = Math.round(processingFee * 0.02)
    const disbursedAmount = input.amount - processingFee - interest - insurance - exciseDuty

    let status: LoanApplication['status'] = 'UNDER_ASSESSMENT'
    let declineReason: DeclineReasonCode | undefined

    if (!anchor.drawdownAllowed) {
      status = 'DECLINED'
      declineReason = 'CREDIT_CHECK_ISSUE'
    } else if (input.amount > anchor.availableLimit) {
      status = 'DECLINED'
      declineReason = 'LIMIT_EXCEEDED'
    }

    const application: LoanApplication = {
      id: `app-${applicationSeq++}`,
      reference: `BOO-${String(100000 + applicationSeq).slice(1)}`,
      anchorId: input.anchorId,
      requestedAmount: input.amount,
      tenorDays: input.tenorDays,
      purpose: input.purpose,
      processingFee,
      interest,
      insurance,
      exciseDuty,
      disbursedAmount: status === 'DECLINED' ? 0 : disbursedAmount,
      status,
      declineReason,
      submittedAt: new Date().toISOString(),
      decisionAt: new Date().toISOString(),
      dueDate:
        status !== 'DECLINED'
          ? new Date(Date.now() + input.tenorDays * 86400000).toISOString().slice(0, 10)
          : undefined,
    }

    store.applications.unshift(application)

    if (status === 'UNDER_ASSESSMENT') {
      // simulate an async approval a moment later, like a real credit engine would
      setTimeout(() => {
        application.status = 'APPROVED'
        anchor.availableLimit -= input.amount
        const loan: Loan = {
          id: `loan-${loanSeq}`,
          reference: `BOO-L-${1000 + loanSeq}`,
          applicationId: application.id,
          anchorId: anchor.id,
          principal: input.amount,
          outstandingBalance: input.amount,
          disbursedAt: new Date().toISOString().slice(0, 10),
          dueDate: application.dueDate!,
          status: 'ACTIVE',
        }
        loanSeq++
        store.loans.unshift(loan)
        application.loanId = loan.id
        application.status = 'DISBURSED'
        store.transactions.unshift({
          id: `txn-${transactionSeq}`,
          reference: `TXN-${88000 + transactionSeq}`,
          date: new Date().toISOString().slice(0, 10),
          amount: application.disbursedAmount,
          type: 'DISBURSEMENT',
          anchorId: anchor.id,
          loanId: loan.id,
          status: 'COMPLETED',
        })
        store.notifications.unshift({
          id: `n-${transactionSeq}`,
          type: 'LOAN_DISBURSED',
          title: 'Loan disbursed',
          body: `${formatKESLocal(application.disbursedAmount)} was sent to ${anchor.name} for your order (${loan.reference}).`,
          date: new Date().toISOString(),
          read: false,
          loanId: loan.id,
        })
        transactionSeq++
      }, 2200)
    }

    return delay(application, 900)
  },

  // repaymentService — POST /repayments  (NCBA account path)
  async repayFromNcbaAccount(input: { loanId: string; amount: number }): Promise<{
    success: boolean
    ftxReference: string
    newBalance: number
    loan?: Loan
    transaction?: Transaction
  }> {
    const res = applyRepaymentToLoan(input.loanId, input.amount, 'NCBA_ACCOUNT')
    return delay(res, 900)
  },

  // Applies a successful STK push repayment to the ledger (called once the
  // mpesa service resolves to SUCCESS — see services/mpesa.ts).
  async applyMpesaRepayment(input: { loanId: string; amount: number }): Promise<{
    success: boolean
    ftxReference: string
    newBalance: number
    loan?: Loan
    transaction?: Transaction
  }> {
    const res = applyRepaymentToLoan(input.loanId, input.amount, 'MPESA')
    return delay(res, 900)
  },

  async simulateThreeDayReminder(loanId: string): Promise<AppNotification> {
    const loan = store.loans.find((l) => l.id === loanId)
    if (!loan) throw new Error('Loan not found')
    const anchor = store.anchors.find((a) => a.id === loan.anchorId)
    const notification: AppNotification = {
      id: `n-sim-due-${Date.now()}`,
      type: 'DUE_SOON',
      title: 'Payment due in 3 days (Simulated SMS & In-app)',
      body: `[SMS Alert to ${store.customer.phone}]: Reminder: Your ${anchor?.name ?? 'Anchor'} loan ${loan.reference} balance of ${formatKESLocal(loan.outstandingBalance)} matures on ${loan.dueDate}. Repay via BOOSTA or Paybill 880100.`,
      date: new Date().toISOString(),
      read: false,
      loanId: loan.id,
    }
    store.notifications.unshift(notification)
    return delay(notification, 300)
  },

  // Returns backend-provided eligible anchors for customer onboarding
  async getEligibleAnchors(): Promise<Anchor[]> {
    return delay(store.anchors)
  },

  // ---------------------------------------------------------------------------
  // Drawdown & Multi-Signatory Service (Phase 3)
  // ---------------------------------------------------------------------------

  async getDrawdownRequests(): Promise<DrawdownRequest[]> {
    return delay([...store.drawdownRequests])
  },

  async getDrawdownRequest(id: string): Promise<DrawdownRequest | undefined> {
    return delay(store.drawdownRequests.find((r) => r.id === id || r.reference === id))
  },

  async getDrawdownByToken(token: string): Promise<{
    request?: DrawdownRequest
    approval?: DrawdownRequest['approvals'][0]
    tokenStatus: 'VALID' | 'USED' | 'EXPIRED' | 'NOT_FOUND'
  }> {
    // Special demo cases
    if (token === 'token-expired') {
      const req = store.drawdownRequests[0]
      return delay({
        request: req,
        approval: req ? req.approvals[0] : undefined,
        tokenStatus: 'EXPIRED',
      })
    }

    for (const req of store.drawdownRequests) {
      const match = req.approvals.find((a) => a.token === token)
      if (match) {
        if (req.tokenExpiresAt && new Date(req.tokenExpiresAt).getTime() < Date.now()) {
          return delay({ request: req, approval: match, tokenStatus: 'EXPIRED' })
        }
        if (match.status !== 'PENDING') {
          return delay({ request: req, approval: match, tokenStatus: 'USED' })
        }
        return delay({ request: req, approval: match, tokenStatus: 'VALID' })
      }
    }

    return delay({ tokenStatus: 'NOT_FOUND' })
  },

  async createDrawdown(input: {
    anchorId: string
    amount: number
    tenorDays: LoanTenorDays
    purpose: string
    mandate?: MandateType
    signatories?: { id: string; fullName: string; phone: string }[]
  }): Promise<{
    status: 'DISBURSED' | 'PENDING_APPROVAL' | 'DECLINED'
    drawdownRequest: DrawdownRequest
    loan?: Loan
    declineReason?: DeclineReasonCode
  }> {
    const anchor = store.anchors.find((a) => a.id === input.anchorId)
    if (!anchor) throw new Error('Anchor facility not found')

    if (!anchor.drawdownAllowed) {
      const req: DrawdownRequest = {
        id: `dd-req-${drawdownSeq++}`,
        reference: `BOO-DR-${2000 + drawdownSeq}`,
        anchorId: input.anchorId,
        amount: input.amount,
        tenorDays: input.tenorDays,
        purpose: input.purpose,
        status: 'REJECTED',
        initiatedBy: store.customer.fullName,
        mandateType: input.mandate ?? 'SINGLE',
        approvals: [],
        createdAt: new Date().toISOString(),
      }
      return delay({ status: 'DECLINED', drawdownRequest: req, declineReason: 'CREDIT_CHECK_ISSUE' })
    }

    if (input.amount > anchor.availableLimit) {
      const req: DrawdownRequest = {
        id: `dd-req-${drawdownSeq++}`,
        reference: `BOO-DR-${2000 + drawdownSeq}`,
        anchorId: input.anchorId,
        amount: input.amount,
        tenorDays: input.tenorDays,
        purpose: input.purpose,
        status: 'REJECTED',
        initiatedBy: store.customer.fullName,
        mandateType: input.mandate ?? 'SINGLE',
        approvals: [],
        createdAt: new Date().toISOString(),
      }
      return delay({ status: 'DECLINED', drawdownRequest: req, declineReason: 'LIMIT_EXCEEDED' })
    }

    const calc = calculateDrawdownBreakdown({
      principal: input.amount,
      tenorDays: input.tenorDays,
      facilityFeePct: anchor.facilityFeePct ?? 2.5,
    })

    const mandate = input.mandate ?? 'SINGLE'
    const isSingleMandate = mandate === 'SINGLE' || !input.signatories || input.signatories.length === 0

    const reqId = `dd-req-${drawdownSeq++}`
    const reqRef = `BOO-DR-${2000 + drawdownSeq}`

    if (isSingleMandate) {
      // 1. Instant disbursement under single mandate
      anchor.availableLimit -= input.amount

      const loan: Loan = {
        id: `loan-${loanSeq++}`,
        reference: `BOO-L-${1000 + loanSeq}`,
        applicationId: reqId,
        anchorId: anchor.id,
        principal: input.amount,
        outstandingBalance: input.amount,
        disbursedAt: new Date().toISOString().slice(0, 10),
        dueDate: calc.dueDate,
        status: 'ACTIVE',
      }
      store.loans.unshift(loan)

      store.transactions.unshift({
        id: `txn-${transactionSeq++}`,
        reference: `TXN-${88000 + transactionSeq}`,
        date: new Date().toISOString().slice(0, 10),
        amount: calc.disbursedToAnchor,
        type: 'DISBURSEMENT',
        anchorId: anchor.id,
        loanId: loan.id,
        status: 'COMPLETED',
      })

      store.notifications.unshift({
        id: `n-${Date.now()}`,
        type: 'LOAN_DISBURSED',
        title: 'Drawdown Disbursed Instantly',
        body: `${formatKESLocal(calc.disbursedToAnchor)} disbursed to ${anchor.name} collection account (${anchor.collectionAccountNumber || '1002450091'}). Ref: ${loan.reference}`,
        date: new Date().toISOString(),
        read: false,
        loanId: loan.id,
      })

      const drawdownRequest: DrawdownRequest = {
        id: reqId,
        reference: reqRef,
        anchorId: input.anchorId,
        amount: input.amount,
        tenorDays: input.tenorDays,
        purpose: input.purpose,
        status: 'DISBURSED',
        initiatedBy: store.customer.fullName,
        mandateType: 'SINGLE',
        approvals: [],
        createdAt: new Date().toISOString(),
        decidedAt: new Date().toISOString(),
        loanId: loan.id,
      }
      store.drawdownRequests.unshift(drawdownRequest)

      return delay({ status: 'DISBURSED', drawdownRequest, loan })
    }

    // 2. Joint mandate: creates PENDING_APPROVAL and dispatches tokens to signatories
    const signatories = input.signatories || [
      { id: 'sig-1', fullName: 'Grace Wambui (Director)', phone: '0722000001' },
      { id: 'sig-2', fullName: 'David Omondi (Director)', phone: '0722000002' },
    ]

    const approvals = signatories.map((s, idx) => ({
      signatoryId: s.id,
      signatoryName: s.fullName,
      token: `token-sig-${s.id}-${Date.now().toString(36)}-${idx}`,
      status: 'PENDING' as const,
    }))

    const drawdownRequest: DrawdownRequest = {
      id: reqId,
      reference: reqRef,
      anchorId: input.anchorId,
      amount: input.amount,
      tenorDays: input.tenorDays,
      purpose: input.purpose,
      status: 'PENDING_APPROVAL',
      initiatedBy: store.customer.fullName,
      mandateType: mandate,
      approvals,
      tokenExpiresAt: new Date(Date.now() + 86_400_000 * 3).toISOString(),
      createdAt: new Date().toISOString(),
    }

    store.drawdownRequests.unshift(drawdownRequest)

    store.notifications.unshift({
      id: `n-${Date.now()}`,
      type: 'LOAN_APPROVED',
      title: 'Joint Mandate Drawdown Initiated',
      body: `Drawdown of ${formatKESLocal(input.amount)} for ${anchor.name} is awaiting signatory approval. SMS review links dispatched.`,
      date: new Date().toISOString(),
      read: false,
    })

    return delay({ status: 'PENDING_APPROVAL', drawdownRequest })
  },

  async approveSignatoryDrawdown(
    requestId: string,
    token: string,
    signatureUrl: string
  ): Promise<{ drawdownRequest: DrawdownRequest; disbursed: boolean }> {
    const req = store.drawdownRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Drawdown request not found')

    const approval = req.approvals.find((a) => a.token === token)
    if (!approval) throw new Error('Signatory token not found')

    approval.status = 'APPROVED'
    approval.signatureUrl = signatureUrl
    approval.at = new Date().toISOString()

    // Check mandate completion
    const isJointAny = req.mandateType === 'JOINT_ANY'
    const approvedCount = req.approvals.filter((a) => a.status === 'APPROVED').length
    const isCompleted = isJointAny
      ? approvedCount >= 1
      : approvedCount === req.approvals.length

    let disbursed = false
    if (isCompleted && req.status !== 'DISBURSED') {
      const anchor = store.anchors.find((a) => a.id === req.anchorId)!
      const calc = calculateDrawdownBreakdown({
        principal: req.amount,
        tenorDays: req.tenorDays,
        facilityFeePct: anchor.facilityFeePct ?? 2.5,
      })

      anchor.availableLimit -= req.amount

      const loan: Loan = {
        id: `loan-${loanSeq++}`,
        reference: `BOO-L-${1000 + loanSeq}`,
        applicationId: req.id,
        anchorId: anchor.id,
        principal: req.amount,
        outstandingBalance: req.amount,
        disbursedAt: new Date().toISOString().slice(0, 10),
        dueDate: calc.dueDate,
        status: 'ACTIVE',
      }
      store.loans.unshift(loan)

      store.transactions.unshift({
        id: `txn-${transactionSeq++}`,
        reference: `TXN-${88000 + transactionSeq}`,
        date: new Date().toISOString().slice(0, 10),
        amount: calc.disbursedToAnchor,
        type: 'DISBURSEMENT',
        anchorId: anchor.id,
        loanId: loan.id,
        status: 'COMPLETED',
      })

      store.notifications.unshift({
        id: `n-${Date.now()}`,
        type: 'LOAN_DISBURSED',
        title: 'Multi-Signatory Drawdown Disbursed',
        body: `All required signatories have signed. ${formatKESLocal(calc.disbursedToAnchor)} disbursed to ${anchor.name}. Ref: ${loan.reference}`,
        date: new Date().toISOString(),
        read: false,
        loanId: loan.id,
      })

      req.status = 'DISBURSED'
      req.decidedAt = new Date().toISOString()
      req.loanId = loan.id
      disbursed = true
    }

    return delay({ drawdownRequest: req, disbursed }, 500)
  },

  async reworkSignatoryDrawdown(
    requestId: string,
    token: string,
    comments: string
  ): Promise<DrawdownRequest> {
    const req = store.drawdownRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Drawdown request not found')

    const approval = req.approvals.find((a) => a.token === token)
    if (approval) {
      approval.status = 'REWORK_REQUESTED'
      approval.comments = comments
      approval.at = new Date().toISOString()
    }

    req.status = 'REWORK_REQUESTED'
    req.reworkNotes = comments

    store.notifications.unshift({
      id: `n-${Date.now()}`,
      type: 'DOCUMENT_VERIFICATION',
      title: 'Drawdown Rework Requested',
      body: `Signatory requested revision for ${req.reference}: "${comments}". Click to adjust terms.`,
      date: new Date().toISOString(),
      read: false,
    })

    return delay(req, 400)
  },

  async declineSignatoryDrawdown(
    requestId: string,
    token: string,
    reason: string
  ): Promise<DrawdownRequest> {
    const req = store.drawdownRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Drawdown request not found')

    const approval = req.approvals.find((a) => a.token === token)
    if (approval) {
      approval.status = 'DECLINED'
      approval.comments = reason
      approval.at = new Date().toISOString()
    }

    req.status = 'REJECTED'
    req.reworkNotes = reason
    req.decidedAt = new Date().toISOString()

    store.notifications.unshift({
      id: `n-${Date.now()}`,
      type: 'APPLICATION_DECLINED',
      title: 'Drawdown Declined by Signatory',
      body: `Drawdown ${req.reference} was declined. Reason: "${reason}".`,
      date: new Date().toISOString(),
      read: false,
    })

    return delay(req, 400)
  },

  async resubmitDrawdown(
    requestId: string,
    updates: { amount: number; tenorDays: LoanTenorDays; purpose: string }
  ): Promise<DrawdownRequest> {
    const req = store.drawdownRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Drawdown request not found')

    req.amount = updates.amount
    req.tenorDays = updates.tenorDays
    req.purpose = updates.purpose
    req.status = 'PENDING_APPROVAL'
    req.reworkNotes = undefined

    // Reset approvals to PENDING with fresh single-use tokens
    req.approvals.forEach((a, i) => {
      a.status = 'PENDING'
      a.comments = undefined
      a.signatureUrl = undefined
      a.at = undefined
      a.token = `token-sig-${a.signatoryId}-${Date.now().toString(36)}-${i}`
    })

    store.notifications.unshift({
      id: `n-${Date.now()}`,
      type: 'LOAN_APPROVED',
      title: 'Drawdown Terms Updated & Resubmitted',
      body: `Drawdown ${req.reference} updated to ${formatKESLocal(updates.amount)} (${updates.tenorDays}d). New SMS approval links sent to signatories.`,
      date: new Date().toISOString(),
      read: false,
    })

    return delay(req, 500)
  },

  // Activates selected anchors and completes customer onboarding profile
  async completeOnboarding(profile: Partial<Customer>): Promise<Customer> {
    store.customer = {
      ...store.customer,
      ...profile,
      kycStatus: 'VERIFIED',
    }
    store.notifications.unshift({
      id: `n-${Date.now()}`,
      type: 'ACCOUNT_VERIFICATION',
      title: 'Facility Activated',
      body: `Welcome to NCBA BOOSTA! Your facility for ${store.customer.businessName} is now active.`,
      date: new Date().toISOString(),
      read: false,
    })
    return delay(store.customer, 600)
  },
}

function applyRepaymentToLoan(
  loanId: string,
  amount: number,
  method: 'NCBA_ACCOUNT' | 'MPESA' = 'NCBA_ACCOUNT'
): {
  success: boolean
  ftxReference: string
  newBalance: number
  loan?: Loan
  transaction?: Transaction
} {
  const loan = store.loans.find((l) => l.id === loanId)
  if (!loan) {
    return { success: false, ftxReference: '', newBalance: 0 }
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.floor(10000 + Math.random() * 90000)
  const ftxReference = `FTX-${dateStr}-${randomSuffix}`

  loan.outstandingBalance = Math.max(0, loan.outstandingBalance - amount)
  if (loan.outstandingBalance === 0) {
    loan.status = 'PAID'
  }

  const anchor = store.anchors.find((a) => a.id === loan.anchorId)
  if (anchor) {
    anchor.availableLimit = Math.min(anchor.approvedLimit, anchor.availableLimit + amount)
  }

  const txn: Transaction = {
    id: `txn-${transactionSeq}`,
    reference: `TXN-${88000 + transactionSeq}`,
    ftxReference,
    date: new Date().toISOString().slice(0, 10),
    amount,
    type: loan.outstandingBalance === 0 ? 'REPAYMENT' : 'PARTIAL_REPAYMENT',
    anchorId: loan.anchorId,
    loanId: loan.id,
    status: 'COMPLETED',
  }
  transactionSeq++
  store.transactions.unshift(txn)

  const isFull = loan.outstandingBalance === 0
  store.notifications.unshift({
    id: `n-${Date.now()}-${transactionSeq}`,
    type: isFull ? 'REPAYMENT_SUCCESS' : 'PARTIAL_REPAYMENT',
    title: isFull ? 'Loan fully paid off 🎉' : 'Partial repayment received',
    body: isFull
      ? `Repayment of ${formatKESLocal(amount)} via ${method === 'MPESA' ? 'M-Pesa STK' : 'NCBA Account'} for ${anchor?.name ?? 'Anchor'} (${loan.reference}) confirmed. FTX Ref: ${ftxReference}. Available limit restored to ${formatKESLocal(anchor?.availableLimit ?? 0)}.`
      : `Repayment of ${formatKESLocal(amount)} via ${method === 'MPESA' ? 'M-Pesa STK' : 'NCBA Account'} for ${anchor?.name ?? 'Anchor'} (${loan.reference}) received. FTX Ref: ${ftxReference}. Remaining balance: ${formatKESLocal(loan.outstandingBalance)}.`,
    date: new Date().toISOString(),
    read: false,
    loanId: loan.id,
  })

  return {
    success: true,
    ftxReference,
    newBalance: loan.outstandingBalance,
    loan,
    transaction: txn,
  }
}

function checkAndGenerateLoanReminders() {
  const now = Date.now()
  store.loans.forEach((loan) => {
    if (loan.status === 'PAID') return

    const dueTime = new Date(loan.dueDate).getTime()
    const days = Math.ceil((dueTime - now) / 86400000)
    const anchor = store.anchors.find((a) => a.id === loan.anchorId)

    if (days <= 3 && days >= 0) {
      const existing = store.notifications.find(
        (n) => n.loanId === loan.id && n.type === 'DUE_SOON' && n.title.includes(`${days}`)
      )
      if (!existing) {
        store.notifications.unshift({
          id: `n-due-${loan.id}-${days}`,
          type: 'DUE_SOON',
          title: days === 0 ? 'Loan payment due today' : `Payment due in ${days} day${days === 1 ? '' : 's'}`,
          body: `Your ${anchor?.name ?? 'Anchor'} loan ${loan.reference} balance of ${formatKESLocal(loan.outstandingBalance)} is due on ${loan.dueDate}. Settle via NCBA Account or M-Pesa.`,
          date: new Date().toISOString(),
          read: false,
          loanId: loan.id,
        })
      }
    }
  })
}

function formatKESLocal(n: number) {
  return `KES ${Math.round(n).toLocaleString('en-KE')}`
}
