import { formatKES } from '../../lib/format'

export function AmountDisplay({
  label,
  amount,
  size = 'md',
  muted = false,
  className = '',
}: {
  label: string
  amount: number
  size?: 'sm' | 'md' | 'lg'
  muted?: boolean
  className?: string
}) {
  const sizeClass = size === 'lg' ? 'text-2xl sm:text-3xl font-extrabold' : size === 'md' ? 'text-lg sm:text-xl font-bold' : 'text-[14px] font-semibold'
  return (
    <div className={className}>
      <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mb-0.5 font-medium">{label}</p>
      <p className={`tracking-tight ${sizeClass} ${muted ? 'text-text-light-muted dark:text-text-dark-muted' : 'text-cocoa dark:text-text-dark-primary'}`}>
        {formatKES(amount)}
      </p>
    </div>
  )
}
