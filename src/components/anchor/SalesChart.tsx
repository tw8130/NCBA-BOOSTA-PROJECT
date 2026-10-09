import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SalesPoint } from '../../types'
import { formatKES } from '../../lib/format'

function CompactKES(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`
  return String(v)
}

export function SalesChart({
  data,
  style = 'line',
  height = 150,
  color = '#00A3E0',
}: {
  data: SalesPoint[]
  style?: 'line' | 'bar'
  height?: number
  color?: string
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {style === 'line' ? (
          <LineChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={CompactKES} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={42} />
            <Tooltip formatter={(v) => formatKES(Number(v))} contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }} />
            <Line type="monotone" dataKey="sales" stroke={color} strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 4.5 }} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={CompactKES} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={42} />
            <Tooltip formatter={(v) => formatKES(Number(v))} contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }} />
            <Bar dataKey="sales" fill={color} radius={[3, 3, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
