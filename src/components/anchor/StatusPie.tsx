import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export interface PieSlice {
  name: string
  value: number
  color: string
}

export function StatusPie({ data, height = 220 }: { data: PieSlice[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((slice) => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
