import type { ReactNode } from 'react'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'

interface Props {
  label: string
  tone?: BadgeTone
  pulsing?: boolean
  icon?: ReactNode
  className?: string
}

const toneStyles: Record<BadgeTone, { badge: string; dot: string; text: string }> = {
  // Mediterranean tint with Cocoa text (A5 rule: Mediterranean on white is low contrast, Cocoa on Mediterranean tint is 5.4:1)
  success: {
    badge: 'bg-mediterranean-tint border-mediterranean/30 text-cocoa dark:bg-mediterranean/20 dark:border-mediterranean/40 dark:text-text-dark-primary',
    dot: 'bg-mediterranean',
    text: 'text-cocoa dark:text-text-dark-primary',
  },
  // Sun with Cocoa text (A5 rule: Sun text on white forbidden)
  warning: {
    badge: 'bg-sun/25 border-sun/50 text-cocoa dark:text-sun dark:bg-sun/15 dark:border-sun/30',
    dot: 'bg-sun-dark',
    text: 'text-cocoa dark:text-sun',
  },
  // Coral
  danger: {
    badge: 'bg-coral-tint border-coral/30 text-coral dark:text-coral dark:bg-coral/15',
    dot: 'bg-coral',
    text: 'text-coral dark:text-coral',
  },
  // Sky with Cocoa text
  info: {
    badge: 'bg-sky-tint border-sky/30 text-cocoa dark:text-sky dark:bg-sky/20',
    dot: 'bg-sky',
    text: 'text-cocoa dark:text-sky',
  },
  // Neutral
  neutral: {
    badge: 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15 text-text-light-secondary dark:text-text-dark-secondary',
    dot: 'bg-slate-400',
    text: 'text-text-light-secondary dark:text-text-dark-secondary',
  },
  // Passion
  accent: {
    badge: 'bg-passion-tint border-passion/30 text-passion dark:text-passion-tint dark:bg-passion/20',
    dot: 'bg-passion',
    text: 'text-passion dark:text-passion-tint',
  },
}

export function StatusBadge({
  label,
  tone = 'neutral',
  pulsing = false,
  icon,
  className = '',
}: Props) {
  const current = toneStyles[tone] || toneStyles.neutral

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[20px] text-[10px] font-medium border backdrop-blur-[8px] tracking-wide ${current.badge} ${className}`}
    >
      {pulsing ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dot}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.dot}`} />
        </span>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{label}</span>
    </span>
  )
}
