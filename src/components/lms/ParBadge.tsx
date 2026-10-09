import type { CbkParGrade } from '../../types'

interface ParBadgeProps {
  grade: CbkParGrade
  showDpd?: boolean
  className?: string
}

const gradeConfig: Record<
  CbkParGrade,
  { label: string; dpd: string; bg: string; text: string; border: string; dot: string }
> = {
  NORMAL: {
    label: 'Normal',
    dpd: '0–30 DPD',
    bg: 'bg-mediterranean/10 dark:bg-mediterranean/20',
    text: 'text-mediterranean dark:text-sky',
    border: 'border-mediterranean/30',
    dot: 'bg-mediterranean',
  },
  WATCH: {
    label: 'Watch',
    dpd: '31–90 DPD',
    bg: 'bg-sun/20 dark:bg-sun/20',
    text: 'text-cocoa dark:text-sun',
    border: 'border-sun/50',
    dot: 'bg-sun',
  },
  SUBSTANDARD: {
    label: 'Substandard',
    dpd: '91–180 DPD',
    bg: 'bg-coral/15 dark:bg-coral/25',
    text: 'text-coral',
    border: 'border-coral/40',
    dot: 'bg-coral',
  },
  DOUBTFUL: {
    label: 'Doubtful',
    dpd: '181–360 DPD',
    bg: 'bg-coral/25 dark:bg-coral/35',
    text: 'text-coral dark:text-coral',
    border: 'border-coral/60',
    dot: 'bg-coral',
  },
  LOSS: {
    label: 'Loss',
    dpd: '360+ DPD',
    bg: 'bg-cocoa/20 dark:bg-cocoa/50',
    text: 'text-cocoa dark:text-white',
    border: 'border-cocoa/50 dark:border-white/20',
    dot: 'bg-cocoa dark:bg-white',
  },
}

export function ParBadge({ grade, showDpd = false, className = '' }: ParBadgeProps) {
  const conf = gradeConfig[grade] || gradeConfig.NORMAL

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[20px] text-[11px] font-semibold border transition-colors ${conf.bg} ${conf.text} ${conf.border} ${className}`}
      title={`CBK Classification: ${conf.label} (${conf.dpd})`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
      <span>{conf.label}</span>
      {showDpd && <span className="opacity-75 font-normal text-[10px]">({conf.dpd})</span>}
    </span>
  )
}
