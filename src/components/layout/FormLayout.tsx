import { useState, type ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface FormLayoutProps {
  title?: string
  subtitle?: string
  left: ReactNode
  right: ReactNode
  summaryTitle?: string
  mobileSummaryPreview?: ReactNode
  className?: string
}

export function FormLayout({
  title,
  subtitle,
  left,
  right,
  summaryTitle = 'Summary & Live Breakdown',
  mobileSummaryPreview,
  className = '',
}: FormLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h1 className="text-[18px] font-semibold text-cocoa dark:text-text-dark-primary tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid container: 65% / 35% on desktop (>=1024px), single column below 1024px */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start pb-24 lg:pb-0">
        {/* Left Column (65%): Form inputs, uploads, camera, signature */}
        <div className="lg:col-span-6 space-y-4">
          {left}
        </div>

        {/* Right Column (35%): Sticky Summary, Live Calculations, Checklist */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-[58px] space-y-4">
          <div className="rounded-[6px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper p-4">
            <h3 className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between">
              <span>{summaryTitle}</span>
            </h3>
            {right}
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Bottom Sheet / Bar (<1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-dark-paper border-t border-surface-border dark:border-surface-dark-border">
        {mobileDrawerOpen && (
          <div className="p-4 max-h-[60vh] overflow-y-auto border-b border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-surface-dark-bg animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold text-cocoa dark:text-text-dark-primary">
                {summaryTitle}
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="text-[11px] font-medium text-sky p-1"
              >
                Close
              </button>
            </div>
            {right}
          </div>
        )}

        <div className="p-3 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {mobileSummaryPreview ? (
              mobileSummaryPreview
            ) : (
              <span className="text-[12px] font-medium text-cocoa dark:text-text-dark-primary">
                Live Summary & Calculations
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="flex items-center gap-1 px-3 py-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border text-[11px] font-medium text-cocoa dark:text-white bg-surface-light dark:bg-surface-dark-bg"
            aria-label={mobileDrawerOpen ? 'Collapse summary' : 'Expand summary'}
          >
            <span>{mobileDrawerOpen ? 'Hide' : 'Details'}</span>
            {mobileDrawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
