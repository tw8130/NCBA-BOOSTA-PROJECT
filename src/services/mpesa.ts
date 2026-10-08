import type { StkStage } from '../types'

// -----------------------------------------------------------------------------
// M-Pesa STK Push simulation
//
// This is the fix for Problem E: instead of one generic pass/fail, the real
// payments engine reads Safaricom's Daraja ResultCode and classifies it into
// one of these outcomes. The M-Pesa PIN itself is NEVER entered inside this
// app — it's entered on the customer's phone in the native M-Pesa prompt.
// This service only simulates waiting for that callback.
// -----------------------------------------------------------------------------

export type StkOutcome = Exclude<StkStage, 'IDLE' | 'SENDING' | 'SENT' | 'WAITING_CONFIRMATION'>

const OUTCOME_COPY: Record<StkOutcome, { title: string; detail: string }> = {
  WRONG_PIN: {
    title: 'Payment not completed',
    detail: 'The M-Pesa PIN entered was incorrect.',
  },
  CANCELLED: {
    title: 'Payment cancelled',
    detail: 'The request was cancelled on the M-Pesa menu.',
  },
  TIMEOUT: {
    title: 'No response received',
    detail: 'We did not get a response from M-Pesa in time.',
  },
  INSUFFICIENT_FUNDS: {
    title: 'Payment not completed',
    detail: 'There were not enough funds in the M-Pesa account.',
  },
  SYSTEM_FAILURE: {
    title: 'Something went wrong',
    detail: 'M-Pesa could not process this request right now.',
  },
  SUCCESS: {
    title: 'Payment successful',
    detail: 'Your repayment has been received.',
  },
}

export function stkOutcomeCopy(outcome: StkOutcome) {
  return OUTCOME_COPY[outcome]
}

// Demo-only: deterministic-ish sequence so the "wrong PIN → retry → success"
// scenario is reliably demonstrable, while still surfacing the other states
// on request via forceOutcome.
export function triggerStkPush(attemptNumber: number, forceOutcome?: StkOutcome): Promise<StkOutcome> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (forceOutcome) return resolve(forceOutcome)
      if (attemptNumber === 1) return resolve('WRONG_PIN')
      if (attemptNumber === 2) return resolve('WRONG_PIN')
      return resolve('SUCCESS')
    }, 1800)
  })
}

export const MAX_STK_ATTEMPTS = 3
