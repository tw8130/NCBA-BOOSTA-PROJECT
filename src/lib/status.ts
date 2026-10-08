import type {
  LoanApplicationStatus,
  LoanStatus,
  TransactionStatus,
  DeclineReasonCode,
  TurnoverReviewStatus,
} from '../types'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export const applicationStatusMeta: Record<LoanApplicationStatus, { label: string; tone: Tone }> = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  SUBMITTED: { label: 'Submitted', tone: 'info' },
  UNDER_ASSESSMENT: { label: 'Under assessment', tone: 'warning' },
  APPROVED: { label: 'Approved', tone: 'success' },
  DISBURSED: { label: 'Disbursed', tone: 'success' },
  DECLINED: { label: 'Declined', tone: 'danger' },
}

export const loanStatusMeta: Record<LoanStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  OVERDUE: { label: 'Overdue', tone: 'danger' },
  PAID: { label: 'Paid off', tone: 'success' },
}

export const transactionStatusMeta: Record<TransactionStatus, { label: string; tone: Tone }> = {
  COMPLETED: { label: 'Completed', tone: 'success' },
  PENDING: { label: 'Pending', tone: 'warning' },
  FAILED: { label: 'Failed', tone: 'danger' },
}

export const declineReasonCopy: Record<DeclineReasonCode, string> = {
  CREDIT_CHECK_ISSUE: 'Drawdown could not be completed because of an outstanding credit-reference issue.',
  LIMIT_EXCEEDED: 'The amount requested was more than your available limit at the time.',
  ANCHOR_UNAVAILABLE: 'This supplier is temporarily unavailable for financing.',
}

export const turnoverReviewStatusMeta: Record<TurnoverReviewStatus, { label: string; tone: Tone }> = {
  NOT_STARTED: { label: 'Not started', tone: 'neutral' },
  DUE_SOON: { label: 'Due soon', tone: 'warning' },
  OVERDUE: { label: 'Overdue', tone: 'danger' },
  DOCUMENTS_UPLOADED: { label: 'Documents uploaded', tone: 'info' },
  SUBMITTED: { label: 'Submitted', tone: 'info' },
  UNDER_REVIEW: { label: 'Under review', tone: 'warning' },
  APPROVED: { label: 'Approved', tone: 'success' },
  MORE_INFO_REQUIRED: { label: 'More information needed', tone: 'warning' },
  DECLINED: { label: 'Declined', tone: 'danger' },
}
