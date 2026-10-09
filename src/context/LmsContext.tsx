import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { lmsApi } from '../services/lmsApi'
import { useAuth } from './AuthContext'
import type {
  LmsPortfolioSummary,
  LmsPartner,
  LmsCustomer,
  LmsLimitAmendmentRequest,
  LmsAuditEntry,
  T24GlEntry,
  LmsException,
} from '../types'

export interface LmsUser {
  id: string
  name: string
  employeeNumber: string
  role: 'BANK_MAKER' | 'BANK_CHECKER'
  department: string
}

interface LmsContextValue {
  currentUser: LmsUser
  switchLmsRole: (role: 'BANK_MAKER' | 'BANK_CHECKER') => void
  portfolioSummary: LmsPortfolioSummary | null
  customers: LmsCustomer[]
  partners: LmsPartner[]
  limitAmendments: LmsLimitAmendmentRequest[]
  pendingQueueCount: number
  auditTrail: LmsAuditEntry[]
  glEntries: T24GlEntry[]
  exceptions: LmsException[]
  loading: boolean
  refresh: () => Promise<void>
  createPartner: (
    data: Omit<LmsPartner, 'id' | 'createdAt' | 'status'>
  ) => Promise<LmsPartner>
  validateCoreAccount: (
    account: string
  ) => Promise<{ valid: boolean; accountName?: string; branch?: string; error?: string }>
  createLimitAmendment: (data: {
    customerId: string
    proposedLimit: number
    justification: string
    justificationDocName?: string
  }) => Promise<LmsLimitAmendmentRequest>
  approveLimitAmendment: (
    id: string,
    comments: string
  ) => Promise<LmsLimitAmendmentRequest>
  rejectLimitAmendment: (
    id: string,
    comments: string
  ) => Promise<LmsLimitAmendmentRequest>
  resolveException: (id: string, reason: string) => Promise<LmsException>
}

const LmsContext = createContext<LmsContextValue | undefined>(undefined)

const MAKER_USER: LmsUser = {
  id: 'maker-001',
  name: 'Kennedy Ochieng',
  employeeNumber: 'NCBA-EMP-8491',
  role: 'BANK_MAKER',
  department: 'Credit Origination & LMS Operations',
}

const CHECKER_USER: LmsUser = {
  id: 'checker-001',
  name: 'Sylvia Njeri',
  employeeNumber: 'NCBA-EMP-2910',
  role: 'BANK_CHECKER',
  department: 'Credit Risk & Approvals Committee',
}

export function LmsProvider({ children }: { children: ReactNode }) {
  const { role: authRole, signInAs } = useAuth()
  const [currentUser, setCurrentUser] = useState<LmsUser>(
    authRole === 'BANK_CHECKER' ? CHECKER_USER : MAKER_USER
  )

  const [portfolioSummary, setPortfolioSummary] = useState<LmsPortfolioSummary | null>(null)
  const [customers, setCustomers] = useState<LmsCustomer[]>([])
  const [partners, setPartners] = useState<LmsPartner[]>([])
  const [limitAmendments, setLimitAmendments] = useState<LmsLimitAmendmentRequest[]>([])
  const [auditTrail, setAuditTrail] = useState<LmsAuditEntry[]>([])
  const [glEntries, setGlEntries] = useState<T24GlEntry[]>([])
  const [exceptions, setExceptions] = useState<LmsException[]>([])
  const [loading, setLoading] = useState(true)

  // Sync when authRole changes
  useEffect(() => {
    if (authRole === 'BANK_CHECKER') {
      setCurrentUser(CHECKER_USER)
    } else if (authRole === 'BANK_MAKER') {
      setCurrentUser(MAKER_USER)
    }
  }, [authRole])

  const switchLmsRole = useCallback(
    (newRole: 'BANK_MAKER' | 'BANK_CHECKER') => {
      signInAs(newRole)
      setCurrentUser(newRole === 'BANK_CHECKER' ? CHECKER_USER : MAKER_USER)
    },
    [signInAs]
  )

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const [sum, custs, parts, ams, audits, gls, excs] = await Promise.all([
        lmsApi.getPortfolioSummary(),
        lmsApi.getCustomers(),
        lmsApi.getPartners(),
        lmsApi.getLimitAmendments(),
        lmsApi.getAuditTrail(),
        lmsApi.getGlEntries(),
        lmsApi.getExceptions(),
      ])
      setPortfolioSummary(sum)
      setCustomers(custs)
      setPartners(parts)
      setLimitAmendments(ams)
      setAuditTrail(audits)
      setGlEntries(gls)
      setExceptions(excs)
    } catch (err) {
      console.error('Failed to load LMS data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const pendingQueueCount = limitAmendments.filter(
    (a) => a.status === 'PENDING_CHECKER'
  ).length

  const createPartner = useCallback(
    async (data: Omit<LmsPartner, 'id' | 'createdAt' | 'status'>) => {
      const created = await lmsApi.createPartner(data)
      await refresh()
      return created
    },
    [refresh]
  )

  const validateCoreAccount = useCallback(async (account: string) => {
    return lmsApi.validateCoreAccount(account)
  }, [])

  const createLimitAmendment = useCallback(
    async (data: {
      customerId: string
      proposedLimit: number
      justification: string
      justificationDocName?: string
    }) => {
      const created = await lmsApi.createLimitAmendment({
        ...data,
        makerId: currentUser.id,
        makerName: currentUser.name,
      })
      await refresh()
      return created
    },
    [currentUser, refresh]
  )

  const approveLimitAmendment = useCallback(
    async (id: string, comments: string) => {
      const updated = await lmsApi.approveLimitAmendment(
        id,
        currentUser.id,
        currentUser.name,
        comments
      )
      await refresh()
      return updated
    },
    [currentUser, refresh]
  )

  const rejectLimitAmendment = useCallback(
    async (id: string, comments: string) => {
      const updated = await lmsApi.rejectLimitAmendment(
        id,
        currentUser.id,
        currentUser.name,
        comments
      )
      await refresh()
      return updated
    },
    [currentUser, refresh]
  )

  const resolveException = useCallback(
    async (id: string, reason: string) => {
      const updated = await lmsApi.resolveException(id, reason)
      await refresh()
      return updated
    },
    [refresh]
  )

  return (
    <LmsContext.Provider
      value={{
        currentUser,
        switchLmsRole,
        portfolioSummary,
        customers,
        partners,
        limitAmendments,
        pendingQueueCount,
        auditTrail,
        glEntries,
        exceptions,
        loading,
        refresh,
        createPartner,
        validateCoreAccount,
        createLimitAmendment,
        approveLimitAmendment,
        rejectLimitAmendment,
        resolveException,
      }}
    >
      {children}
    </LmsContext.Provider>
  )
}

export function useLms() {
  const ctx = useContext(LmsContext)
  if (!ctx) throw new Error('useLms must be used within LmsProvider')
  return ctx
}
