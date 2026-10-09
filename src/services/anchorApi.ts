// -----------------------------------------------------------------------------
// Mock NCBA BOOSTA Anchor Portal API layer
//
// Same principle as services/api.ts: prototype contracts only. In production
// this would be its own set of NCBA-owned endpoints (anchorPortalService,
// reportService) sitting behind the anchor's own authenticated session —
// never sharing a session with the customer app.
// -----------------------------------------------------------------------------

import type {
  AnchorCustomer,
  AnchorNotification,
  AnchorTransaction,
  AnchorUser,
  SalesPoint,
  TurnoverReview,
  TurnoverReviewStatus,
} from '../types'
import {
  mockAnchorCustomers,
  mockAnchorNotifications,
  mockAnchorTransactions,
  mockAnchorUser,
  mockAnnualSales,
  mockMonthlySales,
  mockTurnoverReview,
  mockWeeklySales,
} from '../mocks/data'

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const store = {
  user: { ...mockAnchorUser },
  customers: mockAnchorCustomers.map((c) => ({ ...c })),
  monthly: [...mockMonthlySales],
  weekly: [...mockWeeklySales],
  annual: [...mockAnnualSales],
  turnoverReview: { ...mockTurnoverReview },
  notifications: mockAnchorNotifications.map((n) => ({ ...n })),
  transactions: mockAnchorTransactions.map((t) => ({ ...t })),
}

export const anchorApi = {
  async getUser(): Promise<AnchorUser> {
    return delay(store.user)
  },

  async getCustomers(): Promise<AnchorCustomer[]> {
    return delay(store.customers)
  },

  async getCustomer(id: string): Promise<AnchorCustomer | undefined> {
    return delay(store.customers.find((c) => c.customerId === id))
  },

  async getSales(period: 'weekly' | 'monthly' | 'annual'): Promise<SalesPoint[]> {
    const map = { weekly: store.weekly, monthly: store.monthly, annual: store.annual }
    return delay(map[period])
  },

  async getTurnoverReview(): Promise<TurnoverReview> {
    return delay(store.turnoverReview)
  },

  async setTurnoverReviewStatus(
    status: TurnoverReviewStatus,
    extra?: { reviewerComments?: string; newProposedLimit?: number; documents?: string[] }
  ): Promise<TurnoverReview> {
    store.turnoverReview = {
      ...store.turnoverReview,
      status,
      reviewerComments: extra?.reviewerComments ?? store.turnoverReview.reviewerComments,
      newProposedLimit: extra?.newProposedLimit ?? store.turnoverReview.newProposedLimit,
      documents: extra?.documents ?? store.turnoverReview.documents,
      updatedAt: new Date().toISOString(),
    }

    if (status === 'SUBMITTED' && !store.turnoverReview.submittedAt) {
      store.turnoverReview.submittedAt = new Date().toISOString()
    }

    // Dispatch corresponding anchor notification
    if (status === 'UNDER_NCBA_REVIEW') {
      store.notifications.unshift({
        id: `an-${Date.now()}`,
        category: 'SUBMISSION_UPDATE',
        title: 'Turnover submission under NCBA review',
        body: 'Your FY2026 turnover documentation is now being reviewed by the NCBA Credit Risk Committee.',
        date: new Date().toISOString(),
        state: 'unread',
        emailSimulated: true,
        emailSubject: 'NCBA BOOSTA — FY2026 Turnover Review Under Assessment',
        emailBody: 'Dear Partner, NCBA Credit Assessment has commenced the annual turnover audit for your account. You will receive an update within 2 business days.',
      })
    } else if (status === 'APPROVED') {
      store.notifications.unshift({
        id: `an-${Date.now()}`,
        category: 'SUBMISSION_UPDATE',
        title: 'Annual turnover review approved 🎉',
        body: `NCBA Credit Committee approved your FY2026 turnover. Approved facility limit: KES ${(extra?.newProposedLimit || 12_000_000).toLocaleString()}.`,
        date: new Date().toISOString(),
        state: 'unread',
        emailSimulated: true,
        emailSubject: 'NCBA BOOSTA — FY2026 Turnover Review Approved',
        emailBody: `Congratulations. Following evaluation of your audited annual financial turnover, NCBA Bank Kenya has approved your annual review and renewed your BOOSTA anchor facility limit to KES ${(extra?.newProposedLimit || 12_000_000).toLocaleString()}.`,
      })
    } else if (status === 'MORE_INFO_REQUIRED') {
      store.notifications.unshift({
        id: `an-${Date.now()}`,
        category: 'DOCUMENT_REQUEST',
        title: 'Additional documentation requested by NCBA',
        body: extra?.reviewerComments || 'Please provide certified management accounts for Q2/Q3.',
        date: new Date().toISOString(),
        state: 'unread',
        emailSimulated: true,
        emailSubject: 'NCBA BOOSTA — Clarification Required on Turnover Review',
        emailBody: `Dear Partner, NCBA Credit Risk requires additional information to finalize your annual review: "${extra?.reviewerComments || 'Please provide certified management accounts for Q2/Q3.'}". Please upload the requested files in the Anchor Portal.`,
      })
    } else if (status === 'DECLINED') {
      store.notifications.unshift({
        id: `an-${Date.now()}`,
        category: 'SUBMISSION_UPDATE',
        title: 'Annual turnover review declined',
        body: extra?.reviewerComments || 'Turnover requirements not met.',
        date: new Date().toISOString(),
        state: 'unread',
        emailSimulated: true,
        emailSubject: 'NCBA BOOSTA — Annual Turnover Review Decision',
        emailBody: `Dear Partner, following committee review, your turnover review was not approved for facility limit renewal. Reason: ${extra?.reviewerComments || 'Turnover requirements not met.'}. Contact your NCBA Relationship Manager for assistance.`,
      })
    }

    return delay(store.turnoverReview, 400)
  },

  async submitTurnoverReview(documents: string[]): Promise<TurnoverReview> {
    store.turnoverReview = {
      ...store.turnoverReview,
      documents,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // simulate NCBA picking it up for review shortly after
    setTimeout(() => {
      store.turnoverReview = {
        ...store.turnoverReview,
        status: 'UNDER_NCBA_REVIEW',
        updatedAt: new Date().toISOString(),
      }
    }, 2500)
    return delay(store.turnoverReview, 700)
  },

  async getNotifications(): Promise<AnchorNotification[]> {
    return delay(store.notifications)
  },

  async setNotificationState(id: string, state: 'unread' | 'read' | 'archived'): Promise<void> {
    const n = store.notifications.find((x) => x.id === id)
    if (n) n.state = state
    return delay(undefined, 150)
  },

  async markAllNotificationsRead(): Promise<void> {
    store.notifications.forEach((n) => {
      if (n.state === 'unread') n.state = 'read'
    })
    return delay(undefined, 150)
  },

  async getTransactions(): Promise<AnchorTransaction[]> {
    return delay([...store.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)))
  },
}
