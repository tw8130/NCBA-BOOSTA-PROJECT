import type {
  Anchor,
  AnchorCustomer,
  AnchorNotification,
  AnchorTransaction,
  AnchorUser,
  AppNotification,
  Customer,
  Loan,
  LoanApplication,
  SalesPoint,
  SupportCategory,
  Transaction,
  TurnoverReview,
} from '../types'

// All data below is PROTOTYPE / MOCK DATA ONLY — realistic Kenyan sample data
// used purely to demonstrate the experience. No real customer, anchor, or
// vendor data.

export const mockCustomer: Customer = {
  id: 'cust-001',
  fullName: 'Bonface Macharia',
  phone: '0712 345 678',
  email: 'bonface.macharia@example.com',
  ncbaAccountNumber: '1023 4455 667',
  businessName: 'Macharia General Traders',
  businessType: 'SOLE_PROPRIETOR',
  kycStatus: 'VERIFIED',
  memberSince: '2023-11-02',
  prefilledFields: ['fullName', 'nationalId', 'dateOfBirth', 'phone'],
}

export const mockAnchors: Anchor[] = [
  {
    id: 'anchor-eabl',
    name: 'EABL',
    logoInitial: 'E',
    type: 'ANCHOR',
    approvedLimit: 3_000_000,
    availableLimit: 1_800_000, // 3.0M approved − 1.2M currently outstanding across 2 loans
    crbStatus: 'CLEAR',
    drawdownAllowed: true,
    scorecardVersion: 'ncba-scorecard-v1',
  },
  {
    id: 'anchor-coke',
    name: 'Coca-Cola',
    logoInitial: 'C',
    type: 'ANCHOR',
    approvedLimit: 2_000_000,
    availableLimit: 2_000_000,
    crbStatus: 'CLEAR',
    drawdownAllowed: true,
    scorecardVersion: 'ncba-scorecard-v1',
  },
  {
    id: 'anchor-ncba',
    name: 'NCBA Anchor',
    logoInitial: 'N',
    type: 'SUB_ANCHOR',
    approvedLimit: 5_000_000,
    // Limit stays fully visible even though drawdown is restricted — this is
    // the whole point of the new CRB rule (see Problem/Rule 14-15).
    availableLimit: 5_000_000,
    crbStatus: 'REVIEW_REQUIRED',
    drawdownAllowed: false,
    scorecardVersion: 'ncba-scorecard-v1',
  },
]

export const mockLoans: Loan[] = [
  {
    id: 'loan-1',
    reference: 'BOO-L-1001',
    applicationId: 'app-001',
    anchorId: 'anchor-eabl',
    principal: 1_000_000,
    outstandingBalance: 700_000,
    disbursedAt: '2026-08-05',
    dueDate: '2026-09-01',
    status: 'ACTIVE',
  },
  {
    id: 'loan-2',
    reference: 'BOO-L-1002',
    applicationId: 'app-003',
    anchorId: 'anchor-eabl',
    principal: 500_000,
    outstandingBalance: 500_000,
    disbursedAt: '2026-08-20',
    dueDate: '2026-09-15',
    status: 'ACTIVE',
  },
]

export const mockApplications: LoanApplication[] = [
  {
    id: 'app-001',
    reference: 'BOO-000123',
    anchorId: 'anchor-eabl',
    requestedAmount: 1_000_000,
    tenorDays: 30,
    purpose: 'Stock purchase',
    processingFee: 35_000,
    interest: 3_800,
    insurance: 110,
    exciseDuty: 700,
    disbursedAmount: 964_390,
    status: 'DISBURSED',
    submittedAt: '2026-08-05T08:12:00Z',
    decisionAt: '2026-08-05T08:14:00Z',
    dueDate: '2026-09-01',
    loanId: 'loan-1',
  },
  {
    id: 'app-002',
    reference: 'BOO-000124',
    anchorId: 'anchor-ncba',
    requestedAmount: 1_000_000,
    tenorDays: 30,
    purpose: 'Stock purchase',
    processingFee: 0,
    interest: 0,
    insurance: 0,
    exciseDuty: 0,
    disbursedAmount: 0,
    status: 'DECLINED',
    declineReason: 'CREDIT_CHECK_ISSUE',
    submittedAt: '2026-08-12T10:02:00Z',
    decisionAt: '2026-08-12T10:05:00Z',
  },
  {
    id: 'app-003',
    reference: 'BOO-000125',
    anchorId: 'anchor-eabl',
    requestedAmount: 500_000,
    tenorDays: 26,
    purpose: 'Restocking ahead of season',
    processingFee: 17_500,
    interest: 1_760,
    insurance: 55,
    exciseDuty: 350,
    disbursedAmount: 480_335,
    status: 'DISBURSED',
    submittedAt: '2026-08-20T09:30:00Z',
    decisionAt: '2026-08-20T09:33:00Z',
    dueDate: '2026-09-15',
    loanId: 'loan-2',
  },
]

export const mockTransactions: Transaction[] = [
  { id: 'txn-1', reference: 'TXN-88213', date: '2026-08-05', amount: 964_390, type: 'DISBURSEMENT', anchorId: 'anchor-eabl', loanId: 'loan-1', status: 'COMPLETED' },
  { id: 'txn-2', reference: 'TXN-88214', date: '2026-08-05', amount: 35_700, type: 'FEE', anchorId: 'anchor-eabl', loanId: 'loan-1', status: 'COMPLETED' },
  { id: 'txn-3', reference: 'TXN-88350', date: '2026-08-19', amount: 300_000, type: 'PARTIAL_REPAYMENT', anchorId: 'anchor-eabl', loanId: 'loan-1', status: 'COMPLETED' },
  { id: 'txn-4', reference: 'TXN-88355', date: '2026-08-20', amount: 250_000, type: 'REPAYMENT', anchorId: 'anchor-eabl', loanId: 'loan-1', status: 'FAILED' },
  { id: 'txn-5', reference: 'TXN-88420', date: '2026-08-20', amount: 480_335, type: 'DISBURSEMENT', anchorId: 'anchor-eabl', loanId: 'loan-2', status: 'COMPLETED' },
]

export const mockNotifications: AppNotification[] = [
  { id: 'n1', type: 'LOAN_DISBURSED', title: 'Loan disbursed', body: 'KES 964,390 was sent to EABL for your order (BOO-L-1001). Enjoy your stock!', date: '2026-08-05T08:15:00Z', read: true, loanId: 'loan-1' },
  { id: 'n2', type: 'PARTIAL_REPAYMENT', title: 'Partial payment received', body: 'We received KES 300,000 towards loan BOO-L-1001. New balance: KES 700,000.', date: '2026-08-19T14:02:00Z', read: true, loanId: 'loan-1' },
  { id: 'n3', type: 'PAYMENT_FAILED', title: 'Payment did not go through', body: 'Your repayment of KES 250,000 towards BOO-L-1001 could not be completed. Please try again.', date: '2026-08-20T09:11:00Z', read: false, loanId: 'loan-1' },
  { id: 'n4', type: 'LOAN_DISBURSED', title: 'Loan disbursed', body: 'KES 480,335 was sent to EABL for your order (BOO-L-1002).', date: '2026-08-20T09:34:00Z', read: true, loanId: 'loan-2' },
  { id: 'n5', type: 'CRB_RESTRICTION', title: 'Drawdown temporarily unavailable', body: 'Your NCBA Anchor limit of KES 5,000,000 remains available on your account. However, drawdown is temporarily unavailable due to an outstanding credit-reference issue.', date: '2026-08-12T10:05:00Z', read: false },
  { id: 'n6', type: 'DUE_SOON', title: 'Payment due in 3 days', body: 'Your EABL loan BOO-L-1001 balance of KES 700,000 is due on 1 Sep 2026.', date: '2026-08-29T07:00:00Z', read: false, loanId: 'loan-1' },
]

export const supportCategories: SupportCategory[] = [
  { id: 'login', title: 'Login problem', explanation: "You're unable to sign in to your NCBA BOOSTA account.", solution: 'Check your phone number and try again. If you keep seeing an error, request a new verification code.', hasReference: false },
  { id: 'pin', title: 'Forgot PIN', explanation: 'You cannot remember your NCBA BOOSTA app PIN.', solution: "Use 'Forgot PIN' on the sign-in screen to reset it using an OTP sent to your registered number.", hasReference: false },
  { id: 'limit', title: "Can't access my limit", explanation: 'Your limit is not showing, or drawdown is unavailable.', solution: 'If drawdown is restricted, this is usually a credit-reference issue that needs resolving — your limit itself is still valid and visible.', hasReference: true },
  { id: 'application', title: 'Loan application problem', explanation: 'Your drawdown failed or is taking longer than expected.', solution: 'Most drawdowns are decided within minutes. If yours is still pending after 24 hours, contact us with your reference number.', hasReference: true },
  { id: 'repayment', title: 'Repayment problem', explanation: 'A repayment did not go through or is showing the wrong balance.', solution: 'Confirm the payment left your M-Pesa or NCBA account. If it did but your balance has not updated, contact us with the reference number.', hasReference: true },
  { id: 'mpesa', title: 'M-Pesa payment problem', explanation: 'Your M-Pesa STK push failed, timed out, or you entered the wrong PIN.', solution: 'Try the payment again from the Repay screen. You get up to 2 retries before needing to start over.', hasReference: false },
  { id: 'other', title: 'Other', explanation: 'Something else you need help with.', solution: 'Describe your issue and our team will get back to you.', hasReference: true },
]

// ---------------------------------------------------------------------------
// Anchor portal mock data
// ---------------------------------------------------------------------------

export const mockAnchorUser: AnchorUser = {
  id: 'anchor-user-eabl',
  anchorName: 'EABL',
  contactName: 'Grace Wanjiru',
  email: 'grace.wanjiru@eabl.co.ke',
  role: 'ANCHOR',
}

export const mockAnchorCustomers: AnchorCustomer[] = [
  { customerId: 'cust-001', name: 'Bonface Macharia', monthlySales: 450_000, annualSales: 5_200_000, limit: 3_000_000, outstanding: 1_200_000, utilisationPct: 40, status: 'ACTIVE' },
  { customerId: 'cust-002', name: 'Wanjiku Traders', monthlySales: 320_000, annualSales: 3_800_000, limit: 1_500_000, outstanding: 200_000, utilisationPct: 13, status: 'ACTIVE' },
  { customerId: 'cust-003', name: 'Kiptoo General Store', monthlySales: 180_000, annualSales: 2_100_000, limit: 800_000, outstanding: 0, utilisationPct: 0, status: 'DORMANT' },
  { customerId: 'cust-004', name: 'Otieno Wholesalers', monthlySales: 610_000, annualSales: 7_300_000, limit: 2_500_000, outstanding: 2_500_000, utilisationPct: 100, status: 'RESTRICTED' },
  { customerId: 'cust-005', name: 'Amina Distributors', monthlySales: 275_000, annualSales: 3_100_000, limit: 1_200_000, outstanding: 450_000, utilisationPct: 38, status: 'ACTIVE' },
]

export const mockMonthlySales: SalesPoint[] = [
  { label: 'Jan', sales: 2_100_000 },
  { label: 'Feb', sales: 2_350_000 },
  { label: 'Mar', sales: 2_600_000 },
  { label: 'Apr', sales: 2_450_000 },
  { label: 'May', sales: 2_800_000 },
  { label: 'Jun', sales: 3_050_000 },
  { label: 'Jul', sales: 3_200_000 },
  { label: 'Aug', sales: 3_400_000 },
]

export const mockWeeklySales: SalesPoint[] = [
  { label: 'Wk 1', sales: 720_000 },
  { label: 'Wk 2', sales: 810_000 },
  { label: 'Wk 3', sales: 690_000 },
  { label: 'Wk 4', sales: 880_000 },
  { label: 'Wk 5', sales: 940_000 },
  { label: 'Wk 6', sales: 860_000 },
  { label: 'Wk 7', sales: 910_000 },
  { label: 'Wk 8', sales: 990_000 },
]

export const mockAnnualSales: SalesPoint[] = [
  { label: '2024', sales: 24_500_000 },
  { label: '2025', sales: 29_800_000 },
  { label: '2026 (YTD)', sales: 21_950_000 },
]

export const mockTurnoverReview: TurnoverReview = {
  id: 'tr-2026',
  period: 'FY2026',
  status: 'DUE_SOON',
  dueDate: '2026-09-20',
  documents: [],
  updatedAt: '2026-08-21T09:00:00Z',
}

export const mockAnchorNotifications: AnchorNotification[] = [
  {
    id: 'an1', category: 'REVIEW_REMINDER', title: 'Annual review due in 14 days',
    body: 'Your annual BOOSTA turnover review is due in 14 days.', date: '2026-08-21T08:00:00Z',
    state: 'unread', emailSimulated: true,
    emailSubject: 'NCBA BOOSTA Annual Review Reminder',
    emailBody: 'Your annual turnover review for EABL is due in 14 days. Please log in to the BOOSTA Anchor Portal to submit the required information.',
  },
  {
    id: 'an2', category: 'PERFORMANCE', title: 'Strong August performance',
    body: 'Sales across your BOOSTA retailers are up 6% versus July.', date: '2026-08-18T07:30:00Z',
    state: 'read', emailSimulated: false,
  },
  {
    id: 'an3', category: 'SUBMISSION_UPDATE', title: 'Previous submission approved',
    body: 'Your FY2025 turnover submission has been approved by NCBA credit.', date: '2026-08-10T11:15:00Z',
    state: 'read', emailSimulated: true,
    emailSubject: 'NCBA BOOSTA — FY2025 Turnover Review Approved',
    emailBody: 'Thank you for submitting your FY2025 turnover documentation. NCBA has completed its review and approved your submission.',
  },
  {
    id: 'an4', category: 'DOCUMENT_REQUEST', title: 'Additional document requested',
    body: "We need Otieno Wholesalers' latest aging debtors report to complete their assessment.", date: '2026-08-08T13:45:00Z',
    state: 'unread', emailSimulated: false,
  },
  {
    id: 'an5', category: 'NCBA_COMMUNICATION', title: 'New product pricing effective 1 Sept',
    body: 'Updated BOOSTA commission tiers take effect from 1 September 2026.', date: '2026-08-02T09:00:00Z',
    state: 'archived', emailSimulated: false,
  },
]

export const mockAnchorTransactions: AnchorTransaction[] = [
  { id: 'at1', reference: 'TXN-88213', date: '2026-08-05', type: 'DISBURSEMENT', amount: 964_390, status: 'COMPLETED', customerName: 'Bonface Macharia' },
  { id: 'at2', reference: 'TXN-88420', date: '2026-08-20', type: 'DISBURSEMENT', amount: 480_335, status: 'COMPLETED', customerName: 'Bonface Macharia' },
  { id: 'at3', reference: 'TXN-88350', date: '2026-08-19', type: 'REPAYMENT', amount: 300_000, status: 'COMPLETED', customerName: 'Bonface Macharia' },
  { id: 'at4', reference: 'TXN-88510', date: '2026-08-22', type: 'DISBURSEMENT', amount: 1_950_000, status: 'COMPLETED', customerName: 'Otieno Wholesalers' },
  { id: 'at5', reference: 'TXN-88600', date: '2026-08-24', type: 'FEES', amount: 68_250, status: 'COMPLETED' },
  { id: 'at6', reference: 'TXN-88650', date: '2026-08-25', type: 'SETTLEMENT', amount: 5_200_000, status: 'PENDING' },
]
