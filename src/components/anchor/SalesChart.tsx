import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SalesPoint } from '../../types'
import { formatKES } from '../../lib/format'

function CompactKES(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`
  return String(v)
}

export function SalesChart({ data, style = 'line', height = 220 }: { data: SalesPoint[]; style?: 'line' | 'bar'; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {style === 'line' ? (
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={CompactKES} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip formatter={(v) => formatKES(Number(v))} contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Line type="monotone" dataKey="sales" stroke="#3AB3E5" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      ) : (
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={CompactKES} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip formatter={(v) => formatKES(Number(v))} contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="sales" fill="#00A8A9" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}
