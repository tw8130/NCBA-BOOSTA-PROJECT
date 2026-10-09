import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export interface PieSlice {
  name: string
  value: number
  color: string
}

export function StatusPie({ data, height = 150 }: { data: PieSlice[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={2}>
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
