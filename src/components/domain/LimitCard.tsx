import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'
import { formatKES } from '../../lib/format'
import type { Anchor } from '../../types'

export function LimitCard({
  totalApproved,
  totalUsed,
  totalAvailable,
  anchors,
}: {
  totalApproved: number
  totalUsed: number
  totalAvailable: number
  anchors: Anchor[]
}) {
  const restricted = anchors.filter((a) => !a.drawdownAllowed)
  const utilisationPct = totalApproved > 0 ? Math.min(100, Math.round((totalUsed / totalApproved) * 100)) : 0

  // SVG circular ring metrics
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (utilisationPct / 100) * circumference

  return (
    <Card className="p-5 bg-cocoa text-white border border-white/10 rounded-[6px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">
            NCBA BOOSTA Facility
          </p>
          <h2 className="text-[15px] font-bold text-white tracking-tight">
            Credit Limit Overview
          </h2>
        </div>
        {restricted.length > 0 && (
          <StatusBadge
            label={`${restricted.length} anchor${restricted.length > 1 ? 's' : ''} on hold`}
            tone="warning"
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[11px] text-white/70 mb-0.5">Total available limit, right now</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatKES(totalAvailable)}
          </p>
        </div>

        {/* Sky Progress Ring for Utilisation (A5 Requirement) */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2 rounded-[4px] self-start sm:self-auto">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-white/15"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                className="stroke-sky transition-all duration-500"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-white">
              {utilisationPct}%
            </span>
          </div>
          <div>
            <p className="text-[10px] text-white/60 font-medium uppercase">Utilisation</p>
            <p className="text-[12px] font-semibold text-sky">{formatKES(totalUsed)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-white/10">
        <div>
          <p className="text-[11px] text-white/60">Total approved limit</p>
          <p className="text-[14px] font-bold text-white">{formatKES(totalApproved)}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/60">Total utilised limit</p>
          <p className="text-[14px] font-bold text-white">{formatKES(totalUsed)}</p>
        </div>
      </div>
    </Card>
  )
}
