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
  Loan,
  LoanApplication,
  ScorecardDecision,
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

const LATENCY = 500

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
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
}

let applicationSeq = store.applications.length + 1
let loanSeq = store.loans.length + 1
let transactionSeq = store.transactions.length + 1

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
    return delay(store.notifications)
  },

  async markNotificationRead(id: string): Promise<void> {
    const n = store.notifications.find((x) => x.id === id)
    if (n) n.read = true
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
  async repayFromNcbaAccount(input: { loanId: string; amount: number }): Promise<{ success: boolean }> {
    applyRepaymentToLoan(input.loanId, input.amount)
    return delay({ success: true }, 900)
  },

  // Applies a successful STK push repayment to the ledger (called once the
  // mpesa service resolves to SUCCESS — see services/mpesa.ts).
  async applyMpesaRepayment(input: { loanId: string; amount: number }) {
    return this.repayFromNcbaAccount(input)
  },
}

function applyRepaymentToLoan(loanId: string, amount: number) {
  const loan = store.loans.find((l) => l.id === loanId)
  if (!loan) return
  loan.outstandingBalance = Math.max(0, loan.outstandingBalance - amount)
  if (loan.outstandingBalance === 0) loan.status = 'PAID'

  const anchor = store.anchors.find((a) => a.id === loan.anchorId)
  if (anchor) anchor.availableLimit += amount

  store.transactions.unshift({
    id: `txn-${transactionSeq}`,
    reference: `TXN-${88000 + transactionSeq}`,
    date: new Date().toISOString().slice(0, 10),
    amount,
    type: loan.outstandingBalance === 0 ? 'REPAYMENT' : 'PARTIAL_REPAYMENT',
    anchorId: loan.anchorId,
    loanId: loan.id,
    status: 'COMPLETED',
  })
  transactionSeq++
}

function formatKESLocal(n: number) {
  return `KES ${Math.round(n).toLocaleString('en-KE')}`
}
