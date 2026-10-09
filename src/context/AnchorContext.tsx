import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { anchorApi } from '../services/anchorApi'
import type {
  AnchorCustomer,
  AnchorNotification,
  AnchorTransaction,
  AnchorUser,
  SalesPoint,
  TurnoverReview,
  TurnoverReviewStatus,
} from '../types'

interface AnchorState {
  user: AnchorUser | null
  customers: AnchorCustomer[]
  monthlySales: SalesPoint[]
  weeklySales: SalesPoint[]
  annualSales: SalesPoint[]
  turnoverReview: TurnoverReview | null
  notifications: AnchorNotification[]
  transactions: AnchorTransaction[]
  loading: boolean
  refresh: () => Promise<void>
  setNotificationState: (id: string, state: 'unread' | 'read' | 'archived') => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  setTurnoverReviewStatus: (
    status: TurnoverReviewStatus,
    extra?: { reviewerComments?: string; newProposedLimit?: number; documents?: string[] }
  ) => Promise<void>
}

const AnchorContext = createContext<AnchorState | undefined>(undefined)

export function AnchorProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnchorUser | null>(null)
  const [customers, setCustomers] = useState<AnchorCustomer[]>([])
  const [monthlySales, setMonthlySales] = useState<SalesPoint[]>([])
  const [weeklySales, setWeeklySales] = useState<SalesPoint[]>([])
  const [annualSales, setAnnualSales] = useState<SalesPoint[]>([])
  const [turnoverReview, setTurnoverReview] = useState<TurnoverReview | null>(null)
  const [notifications, setNotifications] = useState<AnchorNotification[]>([])
  const [transactions, setTransactions] = useState<AnchorTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [u, c, m, w, a, tr, n, t] = await Promise.all([
      anchorApi.getUser(),
      anchorApi.getCustomers(),
      anchorApi.getSales('monthly'),
      anchorApi.getSales('weekly'),
      anchorApi.getSales('annual'),
      anchorApi.getTurnoverReview(),
      anchorApi.getNotifications(),
      anchorApi.getTransactions(),
    ])
    setUser(u)
    setCustomers(c)
    setMonthlySales(m)
    setWeeklySales(w)
    setAnnualSales(a)
    setTurnoverReview(tr)
    setNotifications(n)
    setTransactions(t)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setNotificationState = useCallback(async (id: string, state: 'unread' | 'read' | 'archived') => {
    await anchorApi.setNotificationState(id, state)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, state } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await anchorApi.markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => (n.state === 'unread' ? { ...n, state: 'read' } : n)))
  }, [])

  const setTurnoverReviewStatus = useCallback(
    async (
      status: TurnoverReviewStatus,
      extra?: { reviewerComments?: string; newProposedLimit?: number; documents?: string[] }
    ) => {
      const updated = await anchorApi.setTurnoverReviewStatus(status, extra)
      setTurnoverReview(updated)
      // refresh notifications since status transitions trigger notices
      const notifs = await anchorApi.getNotifications()
      setNotifications(notifs)
    },
    []
  )

  return (
    <AnchorContext.Provider
      value={{
        user,
        customers,
        monthlySales,
        weeklySales,
        annualSales,
        turnoverReview,
        notifications,
        transactions,
        loading,
        refresh,
        setNotificationState,
        markAllNotificationsRead,
        setTurnoverReviewStatus,
      }}
    >
      {children}
    </AnchorContext.Provider>
  )
}

export function useAnchorPortal() {
  const ctx = useContext(AnchorContext)
  if (!ctx) throw new Error('useAnchorPortal must be used within AnchorProvider')
  return ctx
}
