import { useState, type ChangeEvent } from 'react'
import { FileText, Lock, CheckCircle2, ShieldCheck, Upload, AlertCircle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/StatusBadge'

export interface ReassessmentModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export function ReassessmentModal({ onClose, onSuccess }: ReassessmentModalProps) {
  const [statementPeriod, setStatementPeriod] = useState<'6' | '12'>('6')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [statementPassword, setStatementPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Only M-Pesa statement PDF files are accepted.')
      return
    }

    if (selected.size > 15 * 1024 * 1024) {
      setFileError('Statement PDF size exceeds 15 MB limit.')
      return
    }

    setFile(selected)
  }

  async function handleSubmit() {
    if (!file) {
      setFileError('Please select your M-Pesa statement PDF.')
      return
    }

    if (statementPassword.length !== 6 || !/^\d{6}$/.test(statementPassword)) {
      setFileError('Please enter the 6-digit numeric statement password (e.g., your National ID).')
      return
    }

    setSubmitting(true)
    setFileError(null)

    // Simulate secure transient parsing (password never persisted per Rule A4.8)
    await new Promise((resolve) => setTimeout(resolve, 1400))

    // Clear password immediately from memory
    setStatementPassword('')
    setSubmitting(false)
    setSubmitted(true)

    if (onSuccess) {
      onSuccess()
    }
  }

  if (submitted) {
    return (
      <Modal title="Reassessment Requested" onClose={onClose}>
        <div className="py-4 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-mediterranean/10 text-mediterranean flex items-center justify-center mx-auto border border-mediterranean/20">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-cocoa dark:text-white">
              Turnover Statement Submitted
            </h3>
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-1 max-w-sm mx-auto leading-relaxed">
              Your {statementPeriod}-month M-Pesa statement has been uploaded for automated turnover re-scoring. The credit assessment engine is re-evaluating your aggregate limits.
            </p>
          </div>

          <div className="p-3 bg-sky-tint/20 border border-sky/30 rounded-[4px] text-left text-[11px] text-cocoa dark:text-sky flex items-start gap-2">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-sky" />
            <div>
              <p className="font-semibold text-cocoa dark:text-white">Privacy & Security Guard</p>
              <p className="text-text-light-secondary dark:text-text-dark-secondary text-[11px]">
                Your 6-digit document password was used solely in memory to extract transaction volume and was immediately purged.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button full onClick={onClose}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Request Facility Limit Reassessment" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
          Provide your official M-Pesa mobile money statement to boost your NCBA credit score and qualify for higher facility limits across partner anchors.
        </p>

        {/* Period Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-cocoa dark:text-text-dark-primary uppercase tracking-wide mb-1.5">
            Statement Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatementPeriod('6')}
              className={`p-2.5 rounded-[4px] border text-[12px] font-medium text-left transition-colors ${
                statementPeriod === '6'
                  ? 'border-sky bg-sky-tint/20 dark:bg-sky/15 text-cocoa dark:text-white font-semibold'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary'
              }`}
            >
              <span className="block text-[13px] font-bold text-cocoa dark:text-white">6 Months</span>
              <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted">Standard turnover check</span>
            </button>
            <button
              type="button"
              onClick={() => setStatementPeriod('12')}
              className={`p-2.5 rounded-[4px] border text-[12px] font-medium text-left transition-colors ${
                statementPeriod === '12'
                  ? 'border-sky bg-sky-tint/20 dark:bg-sky/15 text-cocoa dark:text-white font-semibold'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary'
              }`}
            >
              <span className="block text-[13px] font-bold text-cocoa dark:text-white">12 Months</span>
              <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted">Seasonal business cycle</span>
            </button>
          </div>
        </div>

        {/* Statement PDF Upload */}
        <div>
          <label className="block text-[11px] font-semibold text-cocoa dark:text-text-dark-primary uppercase tracking-wide mb-1.5">
            M-Pesa Statement PDF
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-surface-border dark:border-surface-dark-border hover:border-sky/50 rounded-[6px] p-4 cursor-pointer bg-surface-light dark:bg-white/[0.02] transition-colors">
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex items-center gap-2 text-cocoa dark:text-white">
                <FileText size={20} className="text-sky" />
                <span className="text-[12px] font-semibold">{file.name}</span>
                <StatusBadge label={`${(file.size / (1024 * 1024)).toFixed(1)} MB`} tone="neutral" />
              </div>
            ) : (
              <div className="text-center">
                <Upload size={22} className="mx-auto text-sky mb-1" />
                <p className="text-[12px] font-medium text-cocoa dark:text-white">
                  Click to select M-Pesa PDF statement
                </p>
                <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
                  Official Safaricom M-Pesa statement (max 15 MB)
                </p>
              </div>
            )}
          </label>
        </div>

        {/* 6-Digit Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-cocoa dark:text-text-dark-primary uppercase tracking-wide flex items-center gap-1">
              <Lock size={12} className="text-sky" /> Statement PDF Password (6 digits)
            </label>
            <span className="text-[10px] text-text-light-muted dark:text-text-dark-muted">Usually National ID</span>
          </div>
          <input
            type="password"
            maxLength={6}
            value={statementPassword}
            onChange={(e) => setStatementPassword(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
            placeholder="••••••"
            className="w-full tracking-widest text-lg font-mono font-bold text-cocoa dark:text-text-dark-primary px-3 py-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper focus:outline-none focus:border-sky"
          />
          <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted mt-1">
            Required by Safaricom encrypted PDFs. Never persisted, stored, or logged per Rule A4.8.
          </p>
        </div>

        {fileError && (
          <div className="p-2.5 rounded-[4px] bg-coral/10 border border-coral/30 flex items-center gap-2 text-[11px] text-coral font-medium">
            <AlertCircle size={14} className="shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" full onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            full
            onClick={handleSubmit}
            disabled={!file || statementPassword.length !== 6 || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit for Reassessment'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
