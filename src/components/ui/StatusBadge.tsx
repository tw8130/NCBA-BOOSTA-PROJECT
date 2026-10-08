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
  // Mediterranean
  success: {
    badge: 'bg-[#00A8A9]/15 border-[#00A8A9]/30 text-[#00A8A9] dark:text-[#2DD4BF]',
    dot: 'bg-[#00A8A9]',
    text: 'text-[#00A8A9] dark:text-[#2DD4BF]',
  },
  // Sun with Cocoa text (A5 rule: Sun text on white forbidden)
  warning: {
    badge: 'bg-[#F8E200]/25 border-[#F8E200]/50 text-[#39302D] dark:text-[#F8E200] dark:bg-[#F8E200]/15 dark:border-[#F8E200]/30',
    dot: 'bg-[#E0CB00]',
    text: 'text-[#39302D] dark:text-[#F8E200]',
  },
  // Coral
  danger: {
    badge: 'bg-[#E4032C]/15 border-[#E4032C]/30 text-[#E4032C] dark:text-[#F87171]',
    dot: 'bg-[#E4032C]',
    text: 'text-[#E4032C] dark:text-[#F87171]',
  },
  // Sky with Cocoa text
  info: {
    badge: 'bg-[#3AB3E5]/15 border-[#3AB3E5]/30 text-[#39302D] dark:text-[#3AB3E5]',
    dot: 'bg-[#3AB3E5]',
    text: 'text-[#39302D] dark:text-[#3AB3E5]',
  },
  // Neutral
  neutral: {
    badge: 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15 text-text-light-secondary dark:text-text-dark-secondary',
    dot: 'bg-slate-400',
    text: 'text-text-light-secondary dark:text-text-dark-secondary',
  },
  // Passion
  accent: {
    badge: 'bg-[#9F197E]/15 border-[#9F197E]/30 text-[#9F197E] dark:text-[#E879F9]',
    dot: 'bg-[#9F197E]',
    text: 'text-[#9F197E] dark:text-[#E879F9]',
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
