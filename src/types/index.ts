// -----------------------------------------------------------------------------
// NCBA BOOSTA — domain types (v2)
//
// Key business-rule changes from v1, per the updated NCBA Retail Innovation
// brief:
//   - An anchor can have MANY loans at once (not one "activeLoanId"). Each
//     loan is its own record with its own due date.
//   - A CRB issue restricts DRAWDOWN, not the limit itself. The approved
//     limit always stays visible — see `crbStatus` / `drawdownAllowed` below.
//   - Two roles now exist: CUSTOMER and ANCHOR, each with their own portal.
// -----------------------------------------------------------------------------

export type Role = 'CUSTOMER' | 'ANCHOR' | 'BANK_MAKER' | 'BANK_CHECKER'
export type BusinessType = 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'LIMITED_COMPANY'
export type MandateType = 'SINGLE' | 'JOINT_ANY' | 'JOINT_ALL'
export type LoanTenorDays = 7 | 14 | 30 | 60 | 90
export type DrawdownStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'REWORK_REQUESTED' | 'REJECTED' | 'APPROVED' | 'DISBURSED'

export interface GeoCapture {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
  photoUrl: string
}

export interface Signatory {
  id: string
  fullName: string
  nationalId: string
  phone: string
  email?: string
  role: 'DIRECTOR' | 'PARTNER'
  status: 'PENDING' | 'APPROVED' | 'REWORK_REQUESTED' | 'DECLINED'
  signatureUrl?: string
  signedAt?: string
  comments?: string
}

export interface CustomerProfile {
  id: string
  t24Cif?: string
  isExistingNcbaCustomer: boolean
  fullName: string
  nationalId: string
  phone: string
  email?: string
  dob: string
  educationLevel?: string
  prefilledFromT24: string[]
  ncbaAccounts: { number: string; name: string }[]
  businessName: string
  businessType: BusinessType
  mandate: MandateType
  sector: string
  employees: number
  dateStarted: string
  county: string
  subCounty: string
  premises?: GeoCapture
  signatories: Signatory[]
}

export interface AnchorFacility {
  id: string
  name: string
  logoInitial: string
  type: 'ANCHOR' | 'SUB_ANCHOR'
  approvedLimit: number
  availableLimit: number
  collectionAccountNumber: string
  crbStatus: CrbStatus
  drawdownAllowed: boolean
  allowedTenors: LoanTenorDays[]
  baseRateMarginPct: number
  facilityFeePct: number
}

export interface DrawdownRequest {
  id: string
  reference: string
  anchorId: string
  amount: number
  tenorDays: LoanTenorDays
  purpose: string
  status: DrawdownStatus
  initiatedBy: string
  mandateType?: MandateType
  approvals: {
    signatoryId: string
    signatoryName: string
    token: string
    status: Signatory['status']
    comments?: string
    at?: string
    signatureUrl?: string
  }[]
  tokenExpiresAt?: string
  reworkNotes?: string
  createdAt: string
  decidedAt?: string
  loanId?: string
}

export interface LimitAmendment {
  id: string
  customerId: string
  customerName: string
  anchorId: string
  currentLimit: number
  proposedLimit: number
  reason: string
  attachments: string[]
  makerId: string
  checkerId?: string
  checkerComments?: string
  status: 'PENDING_CHECKER' | 'APPROVED' | 'REJECTED'
  createdAt: string
  decidedAt?: string
}

export interface PartnerSetup {
  name: string
  coreAccountNumber: string
  contactPerson: string
  facilityLimit: number
  maxTenor: LoanTenorDays
  baseRate: number
  marginPct: number
  allowedTenors: LoanTenorDays[]
}


export type CrbStatus = 'CLEAR' | 'REVIEW_REQUIRED'

export interface Customer {
  id: string
  fullName: string
  phone: string
  email?: string
  ncbaAccountNumber: string
  businessName: string
  businessType: 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'LIMITED_COMPANY'
  kycStatus: 'PENDING' | 'VERIFIED'
  memberSince: string
  // Fields NCBA already holds vs what still needs the customer's input —
  // used to render the "from NCBA" / "please complete" distinction on Profile.
  prefilledFields: string[]
}

export interface Anchor {
  id: string
  name: string
  logoInitial: string
  type: 'ANCHOR' | 'SUB_ANCHOR'
  approvedLimit: number
  availableLimit: number
  crbStatus: CrbStatus
  drawdownAllowed: boolean
  scorecardVersion: string
  allowedTenors?: LoanTenorDays[]
  facilityFeePct?: number
  collectionAccountNumber?: string
}

export type LoanApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_ASSESSMENT'
  | 'APPROVED'
  | 'DISBURSED'
  | 'DECLINED'

export type DeclineReasonCode =
  | 'CREDIT_CHECK_ISSUE'
  | 'LIMIT_EXCEEDED'
  | 'ANCHOR_UNAVAILABLE'

export interface LoanApplication {
  id: string
  reference: string
  anchorId: string
  requestedAmount: number
  tenorDays: number
  purpose: string
  processingFee: number
  interest: number
  insurance: number
  exciseDuty: number
  disbursedAmount: number
  status: LoanApplicationStatus
  declineReason?: DeclineReasonCode
  submittedAt: string
  decisionAt?: string
  dueDate?: string
  loanId?: string
}

export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'PAID'

// Every drawdown is its OWN loan record — a single anchor can have several
// of these open at once, each with an independent due date and balance.
export interface Loan {
  id: string
  reference: string
  applicationId: string
  anchorId: string
  principal: number
  outstandingBalance: number
  disbursedAt: string
  dueDate: string
  status: LoanStatus
}

export type TransactionType = 'DISBURSEMENT' | 'REPAYMENT' | 'PARTIAL_REPAYMENT' | 'FEE' | 'PENALTY'
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED'

export interface Transaction {
  id: string
  reference: string
  ftxReference?: string
  date: string
  amount: number
  type: TransactionType
  anchorId: string
  loanId?: string
  status: TransactionStatus
}

export type StkStage =
  | 'IDLE'
  | 'SENDING'
  | 'SENT'
  | 'WAITING_CONFIRMATION'
  | 'WRONG_PIN'
  | 'CANCELLED'
  | 'TIMEOUT'
  | 'INSUFFICIENT_FUNDS'
  | 'SYSTEM_FAILURE'
  | 'DUPLICATE'
  | 'SUCCESS'

export type NotificationType =
  | 'LOAN_APPROVED'
  | 'LOAN_DISBURSED'
  | 'REPAYMENT_SUCCESS'
  | 'PARTIAL_REPAYMENT'
  | 'DUE_SOON'
  | 'LOAN_OVERDUE'
  | 'PAYMENT_FAILED'
  | 'CRB_RESTRICTION'
  | 'LIMIT_UPDATE'
  | 'ANCHOR_ADDED'
  | 'ACCOUNT_VERIFICATION'
  | 'KYC_VERIFICATION'
  | 'DOCUMENT_VERIFICATION'
  | 'APPLICATION_DECLINED'
  | 'SYSTEM_MAINTENANCE'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  date: string
  read: boolean
  loanId?: string
}

// What the (future) NCBA scorecard / credit-decision service returns.
// The frontend only ever consumes this shape — it never computes it.
export interface ScorecardDecision {
  customerId: string
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE'
  limit: number
  crbStatus: CrbStatus
  drawdownAllowed: boolean
  anchors: { anchorId: string; approvedLimit: number }[]
}

export interface SupportCategory {
  id: string
  title: string
  explanation: string
  solution: string
  hasReference: boolean
}

// ---------------------------------------------------------------------------
// Anchor portal types
// ---------------------------------------------------------------------------

export interface AnchorUser {
  id: string
  anchorName: string
  contactName: string
  email: string
  role: 'ANCHOR'
}

export type OverdueAgeing = 'Current' | '1-30 DPD' | '31-60 DPD' | '61-90 DPD' | '90+ DPD'

export interface AnchorCustomer {
  customerId: string
  name: string
  nationalId: string
  monthlySales: number
  annualSales: number
  limit: number
  outstanding: number
  utilisationPct: number
  overdueAgeing: OverdueAgeing
  daysOverdue?: number
  upcomingDueDate?: string
  status: 'ACTIVE' | 'DORMANT' | 'RESTRICTED'
}

export interface SalesPoint {
  label: string
  sales: number
}

export type TurnoverReviewStatus =
  | 'NOT_STARTED'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'DOCUMENTS_UPLOADED'
  | 'SUBMITTED'
  | 'UNDER_NCBA_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'MORE_INFO_REQUIRED'
  | 'DECLINED'

export interface TurnoverReview {
  id: string
  period: string
  status: TurnoverReviewStatus
  dueDate: string
  documents: string[]
  reviewerComments?: string
  newProposedLimit?: number
  submittedAt?: string
  updatedAt: string
}

export type AnchorNotificationCategory =
  | 'REVIEW_REMINDER'
  | 'SUBMISSION_UPDATE'
  | 'DOCUMENT_REQUEST'
  | 'NCBA_COMMUNICATION'
  | 'SYSTEM'
  | 'PERFORMANCE'

export interface AnchorNotification {
  id: string
  category: AnchorNotificationCategory
  title: string
  body: string
  date: string
  state: 'unread' | 'read' | 'archived'
  emailSimulated: boolean
  emailSubject?: string
  emailBody?: string
}

export interface AnchorTransaction {
  id: string
  reference: string
  date: string
  type: 'DISBURSEMENT' | 'REPAYMENT' | 'FEES' | 'COLLECTIONS' | 'SETTLEMENT'
  amount: number
  status: TransactionStatus
  customerName?: string
}

// -----------------------------------------------------------------------------
// Phase 6: LMS (Loan Management System) & Maker-Checker Operations
// -----------------------------------------------------------------------------

export type CbkParGrade = 'NORMAL' | 'WATCH' | 'SUBSTANDARD' | 'DOUBTFUL' | 'LOSS'

export interface CbkParSummary {
  grade: CbkParGrade
  label: string
  dpdRange: string
  balanceKes: number
  accountCount: number
  percentage: number
}

export interface LmsPartner {
  id: string
  anchorCode: string
  name: string
  coreAccount: string
  accountName: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  facilityLimit: number
  maxTenor: number
  baseRate: number
  margin: number
  effectiveRate: number
  allowedTenors: number[]
  disbursementMode: 'DIRECT_SETTLEMENT' | 'ESCROW' | 'CORE_ACCOUNT'
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED'
  createdAt: string
  makerId: string
  checkerId?: string
}

export type LimitAmendmentStatus = 'PENDING_CHECKER' | 'APPROVED' | 'REJECTED'

export interface LmsLimitAmendmentRequest {
  id: string
  customerId: string
  customerName: string
  nationalId: string
  anchorId: string
  anchorName: string
  currentLimit: number
  proposedLimit: number
  justification: string
  justificationDocName?: string
  status: LimitAmendmentStatus
  makerId: string
  makerName: string
  submittedAt: string
  checkerId?: string
  checkerName?: string
  checkerComments?: string
  decidedAt?: string
}

export interface LmsAuditEntry {
  id: string
  requestId: string
  action: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  actorId: string
  actorName: string
  actorRole: 'BANK_MAKER' | 'BANK_CHECKER'
  timestamp: string
  details: string
}

export interface LmsCustomer {
  id: string
  name: string
  nationalId: string
  anchorName: string
  limit: number
  outstanding: number
  daysOverdue: number
  parGrade: CbkParGrade
  penaltyAccrued: number // 30% p.a. default penalty
  status: 'PERFORMING' | 'WATCH' | 'NPL'
}

export interface T24GlEntry {
  id: string
  glCode: string
  glAccountName: string
  t24FtReference: string
  transactionDate: string
  valueDate: string
  debit: number
  credit: number
  currency: 'KES'
  description: string
  status: 'POSTED' | 'RECONCILED'
}

export interface LmsException {
  id: string
  t24FtReference: string
  gatewayReference: string
  customerName: string
  channel: 'M-PESA B2C' | 'M-PESA C2B' | 'T24 CORE'
  t24Amount: number
  gatewayAmount: number
  variance: number
  timestamp: string
  status: 'MATCHED' | 'UNMATCHED' | 'MANUAL_OVERRIDE' | 'INVESTIGATING'
  reason?: string
}

export interface LmsPortfolioSummary {
  grossPortfolioKes: number
  collectionsYtdKes: number
  activeAnchorsCount: number
  totalRetailersCount: number
  nplRatioPct: number
  parBreakdown: CbkParSummary[]
}

