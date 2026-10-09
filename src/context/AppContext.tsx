import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../services/api'
import type { Anchor, AppNotification, Customer, Loan, LoanApplication, Transaction } from '../types'

interface AppState {
  customer: Customer | null
  anchors: Anchor[]
  loans: Loan[]
  applications: LoanApplication[]
  transactions: Transaction[]
  notifications: AppNotification[]
  loading: boolean
  refresh: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [c, a, l, ap, t, n] = await Promise.all([
      api.getProfile(),
      api.getAnchors(),
      api.getLoans(),
      api.getApplications(),
      api.getTransactions(),
      api.getNotifications(),
    ])
    setCustomer(c)
    setAnchors(a)
    setLoans(l)
    setApplications(ap)
    setTransactions(t)
    setNotifications(n)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const markNotificationRead = useCallback(async (id: string) => {
    await api.markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await api.markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return (
    <AppContext.Provider
      value={{
        customer,
        anchors,
        loans,
        applications,
        transactions,
        notifications,
        loading,
        refresh,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
