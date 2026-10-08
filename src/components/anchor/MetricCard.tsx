import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'

export function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  tone?: 'neutral' | 'positive' | 'warning'
}) {
  const toneColor = tone === 'positive'
    ? 'text-mediterranean bg-mediterranean/15'
    : tone === 'warning'
      ? 'text-cocoa dark:text-white bg-sun/20'
      : 'text-cocoa dark:text-sky bg-sky-tint dark:bg-sky/15'
  return (
    <Card className="p-4">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${toneColor}`}>
        <Icon size={16} />
      </div>
      <p className="text-xs text-text-light-muted dark:text-text-dark-muted">{label}</p>
      <p className="text-xl font-bold text-cocoa dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-0.5">{sub}</p>}
    </Card>
  )
}
