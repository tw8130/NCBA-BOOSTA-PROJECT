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
      store.turnoverReview = { ...store.turnoverReview, status: 'UNDER_REVIEW', updatedAt: new Date().toISOString() }
    }, 3000)
    return delay(store.turnoverReview, 900)
  },

  async getNotifications(): Promise<AnchorNotification[]> {
    return delay(store.notifications)
  },

  async setNotificationState(id: string, state: 'unread' | 'read' | 'archived'): Promise<void> {
    const n = store.notifications.find((x) => x.id === id)
    if (n) n.state = state
    return delay(undefined, 150)
  },

  async getTransactions(): Promise<AnchorTransaction[]> {
    return delay([...store.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)))
  },
}
