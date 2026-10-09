// -----------------------------------------------------------------------------
// NCBA BOOSTA — Unified Document Uploader Component (All 5 States)
// -----------------------------------------------------------------------------

import { useState, useRef, type ChangeEvent } from 'react'
import { CheckCircle2, FileWarning, Loader2, RotateCcw, UploadCloud, FileText, X } from 'lucide-react'
import { validateUploadFile } from '../../lib/validators'

export type DocStatus = 'EMPTY' | 'UPLOADING' | 'VERIFYING' | 'VERIFIED' | 'FAILED'

export interface DocumentUploaderProps {
  label: string
  description?: string
  required?: boolean
  tag?: string
  status?: DocStatus
  fileName?: string
  simulateFailure?: boolean
  onStatusChange?: (status: DocStatus, fileMeta?: { name: string; size: string }) => void
  onFileSelect?: (file: File) => void
  onRemove?: () => void
}

export function DocumentUploader({
  label,
  description,
  required = true,
  tag,
  status: controlledStatus,
  fileName: controlledFileName,
  simulateFailure = false,
  onStatusChange,
  onFileSelect,
  onRemove,
}: DocumentUploaderProps) {
  const [internalStatus, setInternalStatus] = useState<DocStatus>('EMPTY')
  const [internalFileName, setInternalFileName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const currentStatus = controlledStatus ?? internalStatus
  const currentFileName = controlledFileName ?? internalFileName

  function updateStatus(newStatus: DocStatus, meta?: { name: string; size: string }) {
    setInternalStatus(newStatus)
    onStatusChange?.(newStatus, meta)
  }

  function handleFile(file: File) {
    const validation = validateUploadFile(file)
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file')
      updateStatus('FAILED')
      return
    }

    setErrorMessage(null)
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    setInternalFileName(file.name)
    onFileSelect?.(file)

    // Trigger simulated verification pipeline
    updateStatus('UPLOADING', { name: file.name, size: sizeStr })

    setTimeout(() => {
      updateStatus('VERIFYING', { name: file.name, size: sizeStr })

      setTimeout(() => {
        const isFailure =
          simulateFailure ||
          file.name.toLowerCase().includes('fail') ||
          file.name.toLowerCase().includes('blur')

        if (isFailure) {
          setErrorMessage('Document verification failed: Image resolution low or document expired.')
          updateStatus('FAILED', { name: file.name, size: sizeStr })
        } else {
          updateStatus('VERIFIED', { name: file.name, size: sizeStr })
        }
      }, 900)
    }, 600)
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  function triggerPicker() {
    fileInputRef.current?.click()
  }

  function triggerDemoUpload(fail = false) {
    const mockFile = new File(['mock content'], fail ? 'Document_blur_fail.pdf' : `${label.replace(/\s+/g, '_')}_Official.pdf`, {
      type: 'application/pdf',
    })
    handleFile(mockFile)
  }

  function handleReplace() {
    triggerPicker()
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setInternalFileName('')
    setErrorMessage(null)
    updateStatus('EMPTY')
    onRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const statusConfigs: Record<
    DocStatus,
    { icon: typeof UploadCloud; text: string; tone: string; subText?: string }
  > = {
    EMPTY: {
      icon: UploadCloud,
      text: 'Click or drop file to upload (PDF, PNG, JPG ≤ 5MB)',
      tone: 'bg-black/5 dark:bg-white/5 text-text-light-muted dark:text-text-dark-muted border-surface-border dark:border-white/10',
    },
    UPLOADING: {
      icon: Loader2,
      text: 'Uploading file to secure NCBA vault…',
      tone: 'bg-sky-tint text-cocoa dark:bg-sky/20 dark:text-sky border-sky/30',
      subText: 'Encrypting payload',
    },
    VERIFYING: {
      icon: Loader2,
      text: 'AI OCR & BRS Registry check in progress…',
      tone: 'bg-sun/20 text-cocoa dark:bg-sun/20 dark:text-sun border-sun/40',
      subText: 'Verifying authenticity',
    },
    VERIFIED: {
      icon: CheckCircle2,
      text: 'Document verified & matched to registry',
      tone: 'bg-mediterranean/10 text-cocoa dark:text-text-dark-primary border-mediterranean/30',
      subText: 'Verified',
    },
    FAILED: {
      icon: FileWarning,
      text: errorMessage || 'Verification failed — please replace with a clearer scan',
      tone: 'bg-coral-tint/30 text-coral dark:text-coral border-coral/40',
      subText: 'Action required',
    },
  }

  const cfg = statusConfigs[currentStatus]
  const Icon = cfg.icon

  return (
    <div className="w-full mb-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onInputChange}
      />

      <div
        onClick={currentStatus === 'EMPTY' ? triggerPicker : undefined}
        className={`w-full rounded-[4px] border p-3.5 transition-all text-left ${
          currentStatus === 'EMPTY'
            ? 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper hover:border-sky/50 cursor-pointer'
            : currentStatus === 'VERIFIED'
            ? 'border-mediterranean/30 bg-mediterranean/5'
            : currentStatus === 'FAILED'
            ? 'border-coral/40 bg-coral-tint/10'
            : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-[4px] border flex items-center justify-center shrink-0 ${cfg.tone}`}
          >
            <Icon
              size={18}
              className={currentStatus === 'UPLOADING' || currentStatus === 'VERIFYING' ? 'animate-spin' : ''}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary truncate">
                {label}
              </p>
              {tag && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-[20px] bg-slate-100 dark:bg-slate-800 text-text-light-secondary dark:text-text-dark-secondary font-medium border border-surface-border dark:border-surface-dark-border">
                  {tag}
                </span>
              )}
              {!required && (
                <span className="text-[9px] text-text-light-muted dark:text-text-dark-muted uppercase font-medium">
                  Optional
                </span>
              )}
            </div>

            {description && currentStatus === 'EMPTY' && (
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                {description}
              </p>
            )}

            {currentFileName && currentStatus !== 'EMPTY' && (
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-cocoa dark:text-text-dark-primary">
                <FileText size={12} className="text-sky" />
                <span className="truncate max-w-xs">{currentFileName}</span>
              </div>
            )}

            <p
              className={`text-[11px] mt-1 ${
                currentStatus === 'FAILED'
                  ? 'text-coral font-medium'
                  : currentStatus === 'VERIFIED'
                  ? 'text-cocoa font-medium dark:text-text-dark-primary'
                  : 'text-text-light-muted dark:text-text-dark-muted'
              }`}
            >
              {cfg.text}
            </p>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2 shrink-0">
            {currentStatus === 'EMPTY' && (
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerDemoUpload(false)
                  }}
                  className="text-[10px] text-sky hover:underline p-1"
                >
                  Demo Pass
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerDemoUpload(true)
                  }}
                  className="text-[10px] text-coral hover:underline p-1"
                >
                  Demo Fail
                </button>
              </div>
            )}

            {(currentStatus === 'VERIFIED' || currentStatus === 'FAILED') && (
              <button
                type="button"
                onClick={handleReplace}
                className="text-[11px] font-semibold text-cocoa dark:text-sky hover:underline flex items-center gap-1"
              >
                <RotateCcw size={12} /> Replace
              </button>
            )}

            {currentStatus !== 'EMPTY' && currentStatus !== 'UPLOADING' && currentStatus !== 'VERIFYING' && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Remove document"
                className="p-1 text-text-light-muted hover:text-coral transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
