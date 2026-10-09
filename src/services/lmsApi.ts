import {
  mockLmsPortfolioSummary,
  mockLmsPartners,
  mockLmsCustomers,
  mockLimitAmendments,
  mockLmsAuditTrail,
  mockT24GlEntries,
  mockLmsExceptions,
} from '../mocks/lmsData'
import type {
  LmsPortfolioSummary,
  LmsPartner,
  LmsCustomer,
  LmsLimitAmendmentRequest,
  LmsAuditEntry,
  T24GlEntry,
  LmsException,
} from '../types'

// In-memory persistent state for prototype session
let portfolioSummary = { ...mockLmsPortfolioSummary }
let partners = [...mockLmsPartners]
let customers = [...mockLmsCustomers]
let limitAmendments = [...mockLimitAmendments]
let auditTrail = [...mockLmsAuditTrail]
let glEntries = [...mockT24GlEntries]
let exceptions = [...mockLmsExceptions]

function delay(ms = 60) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const lmsApi = {
  async getPortfolioSummary(): Promise<LmsPortfolioSummary> {
    await delay()
    return JSON.parse(JSON.stringify(portfolioSummary))
  },

  async getCustomers(): Promise<LmsCustomer[]> {
    await delay()
    return JSON.parse(JSON.stringify(customers))
  },

  async getPartners(): Promise<LmsPartner[]> {
    await delay()
    return JSON.parse(JSON.stringify(partners))
  },

  async validateCoreAccount(
    accountNumber: string
  ): Promise<{ valid: boolean; accountName?: string; branch?: string; currency?: string; error?: string }> {
    await delay(120)
    const cleaned = accountNumber.trim().replace(/\D/g, '')

    // Known mock accounts or any 10-digit number
    if (cleaned.length !== 10) {
      return {
        valid: false,
        error: 'NCBA Core Account number must be exactly 10 digits.',
      }
    }

    const known: Record<string, { accountName: string; branch: string }> = {
      '1002938471': { accountName: 'East African Breweries PLC Settlement Ops', branch: 'Upper Hill Corporate Branch' },
      '1003847291': { accountName: 'British American Tobacco Kenya Settlement', branch: 'Industrial Area Branch' },
      '1004958102': { accountName: 'Unilever Supply Chain Control', branch: 'Wabera Street Corporate' },
      '1005182947': { accountName: 'Brookside Raw Milk & Distribution Escrow', branch: 'Thika Road Branch' },
      '1007829103': { accountName: 'Kenya Seed Company Commercial Account', branch: 'Kitale Branch' },
    }

    if (known[cleaned]) {
      return {
        valid: true,
        accountName: known[cleaned].accountName,
        branch: known[cleaned].branch,
        currency: 'KES',
      }
    }

    // Default validated response for prototype testing
    return {
      valid: true,
      accountName: 'NCBA Verified Corporate Client Escrow',
      branch: 'NCBA Centre Upper Hill HQ',
      currency: 'KES',
    }
  },

  async createPartner(
    data: Omit<LmsPartner, 'id' | 'createdAt' | 'status'>
  ): Promise<LmsPartner> {
    await delay(150)
    const newPartner: LmsPartner = {
      ...data,
      id: `prt-${String(partners.length + 1).padStart(3, '0')}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
    partners = [newPartner, ...partners]
    portfolioSummary.activeAnchorsCount = partners.length
    return JSON.parse(JSON.stringify(newPartner))
  },

  async getLimitAmendments(): Promise<LmsLimitAmendmentRequest[]> {
    await delay()
    return JSON.parse(JSON.stringify(limitAmendments))
  },

  async createLimitAmendment(data: {
    customerId: string
    proposedLimit: number
    justification: string
    justificationDocName?: string
    makerId: string
    makerName: string
  }): Promise<LmsLimitAmendmentRequest> {
    await delay(150)
    const cust = customers.find((c) => c.id === data.customerId)
    if (!cust) {
      throw new Error(`Customer with ID ${data.customerId} not found.`)
    }

    const newReqId = `req-${String(limitAmendments.length + 1).padStart(3, '0')}`
    const newReq: LmsLimitAmendmentRequest = {
      id: newReqId,
      customerId: cust.id,
      customerName: cust.name,
      nationalId: cust.nationalId,
      anchorId: 'prt-001',
      anchorName: cust.anchorName,
      currentLimit: cust.limit,
      proposedLimit: data.proposedLimit,
      justification: data.justification,
      justificationDocName: data.justificationDocName || 'Credit_Appraisal_Memo.pdf',
      status: 'PENDING_CHECKER',
      makerId: data.makerId,
      makerName: data.makerName,
      submittedAt: new Date().toISOString(),
    }

    limitAmendments = [newReq, ...limitAmendments]

    // Append to audit trail
    const auditCreated: LmsAuditEntry = {
      id: `aud-${String(auditTrail.length + 1).padStart(3, '0')}`,
      requestId: newReqId,
      action: 'CREATED',
      actorId: data.makerId,
      actorName: data.makerName,
      actorRole: 'BANK_MAKER',
      timestamp: new Date().toISOString(),
      details: `Created limit amendment request for ${cust.name} (KES ${cust.limit.toLocaleString()} → KES ${data.proposedLimit.toLocaleString()}).`,
    }
    const auditSubmitted: LmsAuditEntry = {
      id: `aud-${String(auditTrail.length + 2).padStart(3, '0')}`,
      requestId: newReqId,
      action: 'SUBMITTED',
      actorId: data.makerId,
      actorName: data.makerName,
      actorRole: 'BANK_MAKER',
      timestamp: new Date().toISOString(),
      details: `Submitted to Checker queue with memo "${data.justification.slice(0, 50)}...".`,
    }

    auditTrail = [...auditTrail, auditCreated, auditSubmitted]

    return JSON.parse(JSON.stringify(newReq))
  },

  async approveLimitAmendment(
    id: string,
    checkerId: string,
    checkerName: string,
    comments: string
  ): Promise<LmsLimitAmendmentRequest> {
    await delay(150)
    const req = limitAmendments.find((r) => r.id === id)
    if (!req) {
      throw new Error(`Limit amendment request ${id} not found.`)
    }

    // STRICT MAKER≠CHECKER SEPARATION ENFORCEMENT (CBK Guideline CBK/PG/04)
    if (req.makerId === checkerId) {
      throw new Error(
        `CBK Maker-Checker Separation of Duties violation: Checker (${checkerName}) cannot approve request created by themselves (${req.makerName}).`
      )
    }

    req.status = 'APPROVED'
    req.checkerId = checkerId
    req.checkerName = checkerName
    req.checkerComments = comments
    req.decidedAt = new Date().toISOString()

    // Update the customer limit in LMS customers
    const cust = customers.find((c) => c.id === req.customerId)
    if (cust) {
      cust.limit = req.proposedLimit
    }

    // Append to audit trail
    const auditApprove: LmsAuditEntry = {
      id: `aud-${String(auditTrail.length + 1).padStart(3, '0')}`,
      requestId: id,
      action: 'APPROVED',
      actorId: checkerId,
      actorName: checkerName,
      actorRole: 'BANK_CHECKER',
      timestamp: new Date().toISOString(),
      details: `Approved by Checker ${checkerName}. Limit updated to KES ${req.proposedLimit.toLocaleString()}. Comments: "${comments}"`,
    }
    auditTrail = [...auditTrail, auditApprove]

    return JSON.parse(JSON.stringify(req))
  },

  async rejectLimitAmendment(
    id: string,
    checkerId: string,
    checkerName: string,
    comments: string
  ): Promise<LmsLimitAmendmentRequest> {
    await delay(150)
    const req = limitAmendments.find((r) => r.id === id)
    if (!req) {
      throw new Error(`Limit amendment request ${id} not found.`)
    }

    // STRICT MAKER≠CHECKER SEPARATION ENFORCEMENT
    if (req.makerId === checkerId) {
      throw new Error(
        `CBK Maker-Checker Separation of Duties violation: Checker (${checkerName}) cannot reject own submission.`
      )
    }

    req.status = 'REJECTED'
    req.checkerId = checkerId
    req.checkerName = checkerName
    req.checkerComments = comments
    req.decidedAt = new Date().toISOString()

    // Append to audit trail
    const auditReject: LmsAuditEntry = {
      id: `aud-${String(auditTrail.length + 1).padStart(3, '0')}`,
      requestId: id,
      action: 'REJECTED',
      actorId: checkerId,
      actorName: checkerName,
      actorRole: 'BANK_CHECKER',
      timestamp: new Date().toISOString(),
      details: `Rejected by Checker ${checkerName}. Comments: "${comments}"`,
    }
    auditTrail = [...auditTrail, auditReject]

    return JSON.parse(JSON.stringify(req))
  },

  async getAuditTrail(requestId?: string): Promise<LmsAuditEntry[]> {
    await delay()
    if (requestId) {
      return JSON.parse(
        JSON.stringify(auditTrail.filter((a) => a.requestId === requestId))
      )
    }
    return JSON.parse(JSON.stringify(auditTrail))
  },

  async getGlEntries(): Promise<T24GlEntry[]> {
    await delay()
    return JSON.parse(JSON.stringify(glEntries))
  },

  async getExceptions(): Promise<LmsException[]> {
    await delay()
    return JSON.parse(JSON.stringify(exceptions))
  },

  async resolveException(
    id: string,
    resolutionReason: string
  ): Promise<LmsException> {
    await delay(150)
    const exc = exceptions.find((e) => e.id === id)
    if (!exc) {
      throw new Error(`Exception with ID ${id} not found.`)
    }
    exc.status = 'MANUAL_OVERRIDE'
    exc.reason = `Resolved manually: ${resolutionReason}`
    return JSON.parse(JSON.stringify(exc))
  },
}
