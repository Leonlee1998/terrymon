'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HealthDataPoint } from '@/types'

interface Props {
  data: HealthDataPoint[]
  compact?: boolean
}

function trendLabel(data: HealthDataPoint[]) {
  if (data.length < 2) return '持平'
  const last = data[data.length - 1].value
  const prev = data[data.length - 2].value
  if (last > prev + 0.1) return '上升'
  if (last < prev - 0.1) return '下降'
  return '持平'
}

export default function WeightChart({ data, compact = false }: Props) {
  const chartData = data.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
    value: point.value,
  }))
  const latest = data.at(-1)
  const trend = trendLabel(data)

  return (
    <div className="rounded-3xl border border-[#eadfd2] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-ink">體重趨勢</h4>
          {latest && (
            <p className="mt-0.5 text-xs text-slate-t">
              最新 <span className="font-bold text-primary">{latest.value} kg</span>
              <span className="ml-1 text-[#8d7f71]">{trend}</span>
            </p>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={compact ? 120 : 200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eadfd2" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5C6B5E' }} />
          <YAxis tick={{ fontSize: 10, fill: '#5C6B5E' }} domain={['auto', 'auto']} tickFormatter={value => `${value}kg`} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #eadfd2', fontSize: 12 }}
            formatter={value => [`${value ?? '-'} kg`, '體重']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2B7A4B"
            strokeWidth={2.5}
            dot={{ fill: '#2B7A4B', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
