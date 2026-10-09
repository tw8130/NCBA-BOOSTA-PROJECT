import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FileEdit,
  Upload,
  FileCheck,
  AlertCircle,
  TrendingUp,
  User,
  ShieldAlert,
} from 'lucide-react'
import { LmsShell } from '../../components/layout/LmsShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatKES } from '../../lib/format'
import { useLms } from '../../context/LmsContext'

export default function LmsLimitNew() {
  const { customers, createLimitAmendment, currentUser } = useLms()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const preselectedCustId = searchParams.get('customerId')
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preselectedCustId || (customers[0]?.id ?? '')
  )

  useEffect(() => {
    if (preselectedCustId) {
      setSelectedCustomerId(preselectedCustId)
    }
  }, [preselectedCustId])

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const [proposedLimit, setProposedLimit] = useState<number>(
    selectedCustomer ? selectedCustomer.limit + 250_000 : 750_000
  )
  const [justification, setJustification] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update proposed limit when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setProposedLimit(selectedCustomer.limit + 250_000)
    }
  }, [selectedCustomerId])

  const currentLimit = selectedCustomer?.limit ?? 0
  const delta = proposedLimit - currentLimit
  const deltaPct = currentLimit > 0 ? Math.round((delta / currentLimit) * 100) : 0

  function handleFileSimulate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFileName(file.name)
    } else {
      setUploadedFileName('Credit_Appraisal_Memo_FY26.pdf')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomerId) {
      setError('Please select a borrower.')
      return
    }

    if (proposedLimit <= 0) {
      setError('Proposed limit must be greater than KES 0.')
      return
    }

    if (!justification.trim() || justification.trim().length < 20) {
      setError('Please provide a comprehensive credit justification memo (at least 20 characters).')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await createLimitAmendment({
        customerId: selectedCustomerId,
        proposedLimit,
        justification: justification.trim(),
        justificationDocName: uploadedFileName || 'Credit_Appraisal_Memo_FY26.pdf',
      })

      // Navigate to Checker queue so Maker request is immediately visible in the queue
      navigate('/lms/limits/queue')
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to submit limit amendment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <LmsShell
      title="Initiate Credit Limit Amendment (Maker)"
      subtitle="Prepare and submit limit increases or decreases to the Credit Committee Checker queue"
    >
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        {/* Borrower Selection Card */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <User size={16} className="text-cocoa dark:text-sky" />
            <h2 className="text-sm font-bold text-cocoa dark:text-white">
              1. Select Borrower
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-cocoa dark:text-white mb-1">
                Select Customer from Active Portfolio <span className="text-coral">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Current Limit: {formatKES(c.limit)} ({c.anchorName})
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3 rounded-[4px] bg-surface-light dark:bg-surface-dark-bg border border-surface-border dark:border-surface-dark-border grid sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-text-light-muted block">National ID</span>
                  <span className="font-bold text-cocoa dark:text-white font-mono">
                    {selectedCustomer.nationalId}
                  </span>
                </div>
                <div>
                  <span className="text-text-light-muted block">Corporate Anchor</span>
                  <span className="font-semibold text-cocoa dark:text-white">
                    {selectedCustomer.anchorName}
                  </span>
                </div>
                <div>
                  <span className="text-text-light-muted block">Current Limit</span>
                  <span className="font-bold text-cocoa dark:text-white font-mono">
                    {formatKES(selectedCustomer.limit)}
                  </span>
                </div>
                <div>
                  <span className="text-text-light-muted block">Outstanding Loan</span>
                  <span className="font-bold text-cocoa dark:text-white font-mono">
                    {formatKES(selectedCustomer.outstanding)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Limit Parameters Card */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <TrendingUp size={16} className="text-mediterranean" />
            <h2 className="text-sm font-bold text-cocoa dark:text-white">
              2. Proposed Limit Amendment
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs mb-3">
            <div>
              <label className="block font-bold text-cocoa dark:text-white mb-1">
                Proposed New Limit (KES) <span className="text-coral">*</span>
              </label>
              <input
                type="number"
                min={50_000}
                step={50_000}
                required
                value={proposedLimit}
                onChange={(e) => setProposedLimit(Number(e.target.value))}
                className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white font-mono font-bold text-base focus:outline-none focus:border-sky"
              />
              <p className="text-[10px] text-text-light-muted mt-1">
                Formatted: {formatKES(proposedLimit)}
              </p>
            </div>

            <div className="p-3 rounded-[4px] bg-sky-tint/30 dark:bg-sky/15 border border-sky/30 flex flex-col justify-center">
              <span className="text-[10px] text-text-light-muted font-bold uppercase tracking-wider">
                Variance & Adjustment Impact
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-lg font-bold font-mono ${
                    delta >= 0 ? 'text-mediterranean dark:text-sky' : 'text-coral'
                  }`}
                >
                  {delta >= 0 ? '+' : ''}
                  {formatKES(delta)}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    delta >= 0 ? 'text-mediterranean' : 'text-coral'
                  }`}
                >
                  ({delta >= 0 ? '+' : ''}
                  {deltaPct}%)
                </span>
              </div>
              <span className="text-[10px] text-text-light-muted">
                From current {formatKES(currentLimit)}
              </span>
            </div>
          </div>
        </Card>

        {/* Justification Memo & Upload Card */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <FileEdit size={16} className="text-cocoa dark:text-sky" />
            <h2 className="text-sm font-bold text-cocoa dark:text-white">
              3. Justification Memo & Supporting Audit Memo
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-cocoa dark:text-white mb-1">
                Credit Appraisal Justification Memo <span className="text-coral">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain the commercial rationale, turnover growth, repayment history, or supplier expansion backing this limit amendment..."
                className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky leading-relaxed"
              />
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block font-bold text-cocoa dark:text-white mb-1">
                Upload Justification Document / Risk Memo (PDF)
              </label>
              <div className="p-4 rounded-[4px] border-2 border-dashed border-surface-border dark:border-surface-dark-border text-center hover:border-sky transition-colors cursor-pointer relative bg-white dark:bg-surface-dark-paper">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSimulate}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  {uploadedFileName ? (
                    <>
                      <FileCheck size={24} className="text-mediterranean" />
                      <p className="font-bold text-mediterranean text-xs">
                        {uploadedFileName}
                      </p>
                      <p className="text-[10px] text-text-light-muted">
                        Attached • Ready for Checker queue dispatch
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="text-text-light-muted" />
                      <p className="font-semibold text-cocoa dark:text-white text-xs">
                        Click or drag appraisal paper / financial statements here
                      </p>
                      <p className="text-[10px] text-text-light-muted">
                        PDF up to 10MB (optional in prototype)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Maker Sign-off Advisory */}
        <div className="p-3 rounded-[4px] bg-sun/15 border border-sun/40 flex items-start gap-2.5 text-xs">
          <ShieldAlert size={16} className="text-cocoa shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-cocoa">
              Maker Submission Authority
            </p>
            <p className="text-cocoa/90 text-[11px] mt-0.5 leading-relaxed">
              Initiating as <strong className="font-bold">{currentUser.name}</strong> ({currentUser.employeeNumber}). Once submitted, this request will be routed directly to the Checker Approvals Queue. Per CBK Guideline CBK/PG/04, you cannot approve this request yourself.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-[4px] bg-coral/10 border border-coral/30 flex items-start gap-2 text-xs text-coral">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/lms/customers')}
            className="px-4 py-2 rounded-[4px] border border-surface-border text-xs text-text-light-muted hover:text-cocoa"
          >
            Cancel
          </button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? 'Submitting to Checker Queue…'
              : 'Submit to Checker Approvals Queue'}
          </Button>
        </div>
      </form>
    </LmsShell>
  )
}
