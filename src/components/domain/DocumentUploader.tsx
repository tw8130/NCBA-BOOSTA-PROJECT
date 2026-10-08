import { useState } from 'react'
import { CheckCircle2, FileWarning, Loader2, RotateCcw, UploadCloud } from 'lucide-react'

export type DocStatus = 'EMPTY' | 'UPLOADING' | 'VERIFYING' | 'VERIFIED' | 'FAILED'

export function DocumentUploader({
  label,
  required = true,
  simulateFailure = false,
  onStatusChange,
}: {
  label: string
  required?: boolean
  simulateFailure?: boolean
  onStatusChange?: (status: DocStatus) => void
}) {
  const [status, setStatus] = useState<DocStatus>('EMPTY')

  function upload() {
    setStatus('UPLOADING')
    onStatusChange?.('UPLOADING')
    setTimeout(() => {
      setStatus('VERIFYING')
      onStatusChange?.('VERIFYING')
      setTimeout(() => {
        const next = simulateFailure ? 'FAILED' : 'VERIFIED'
        setStatus(next)
        onStatusChange?.(next)
      }, 1100)
    }, 700)
  }

  const meta: Record<DocStatus, { icon: typeof UploadCloud; text: string; tone: string }> = {
    EMPTY: {
      icon: UploadCloud,
      text: 'Tap to upload file or take photo',
      tone: 'bg-black/5 dark:bg-white/5 text-text-light-muted dark:text-text-dark-muted border border-surface-border dark:border-white/10',
    },
    UPLOADING: {
      icon: Loader2,
      text: 'Uploading document…',
      tone: 'bg-sky-tint text-cocoa dark:bg-sky/20 dark:text-sky border border-sky/30',
    },
    VERIFYING: {
      icon: Loader2,
      text: 'Verification in progress…',
      tone: 'bg-sun/20 text-cocoa dark:bg-sun/20 dark:text-sun border border-sun/40',
    },
    VERIFIED: {
      icon: CheckCircle2,
      text: 'Verified successfully',
      tone: 'bg-mediterranean/10 text-mediterranean dark:text-teal-400 border border-mediterranean/30',
    },
    FAILED: {
      icon: FileWarning,
      text: 'Could not verify document — please replace',
      tone: 'bg-coral/10 text-coral dark:text-coral border border-coral/30',
    },
  }
  const m = meta[status]
  const Icon = m.icon

  return (
    <button
      onClick={upload}
      disabled={status === 'UPLOADING' || status === 'VERIFYING'}
      className="w-full flex items-center gap-3 p-3.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-left mb-3 disabled:opacity-80 hover:border-sky/40 transition-colors"
    >
      <div className={`w-9 h-9 rounded-[4px] flex items-center justify-center shrink-0 ${m.tone}`}>
        <Icon size={17} className={status === 'UPLOADING' || status === 'VERIFYING' ? 'animate-spin' : ''} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary truncate">{label}</p>
          {!required && (
            <span className="text-[9px] text-text-light-muted dark:text-text-dark-muted uppercase tracking-wider shrink-0 font-medium">
              Optional
            </span>
          )}
        </div>
        <p className={`text-[11px] mt-0.5 ${status === 'FAILED' ? 'text-coral' : 'text-text-light-muted dark:text-text-dark-muted'}`}>
          {m.text}
        </p>
      </div>
      {(status === 'VERIFIED' || status === 'FAILED') && (
        <span className="text-[11px] font-semibold text-cocoa dark:text-sky flex items-center gap-1 shrink-0 underline decoration-sky">
          <RotateCcw size={11} /> Replace
        </span>
      )}
    </button>
  )
}
