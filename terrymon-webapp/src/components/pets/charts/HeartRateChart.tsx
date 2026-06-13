'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HealthDataPoint } from '@/types'

interface Props {
  data: HealthDataPoint[]
  compact?: boolean
}

export default function HeartRateChart({ data, compact = false }: Props) {
  const chartData = data.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
    value: point.value,
  }))
  const latest = data.at(-1)

  return (
    <div className="rounded-3xl border border-[#eadfd2] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-ink">心率趨勢</h4>
          {latest && (
            <p className="mt-0.5 text-xs text-slate-t">
              最新 <span className="font-bold text-primary">{latest.value} bpm</span>
            </p>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={compact ? 120 : 200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eadfd2" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5C6B5E' }} />
          <YAxis tick={{ fontSize: 10, fill: '#5C6B5E' }} domain={['auto', 'auto']} tickFormatter={value => `${value} bpm`} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #eadfd2', fontSize: 12 }}
            formatter={value => [`${value ?? '-'} bpm`, '心率']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#FF6B35"
            strokeWidth={2.5}
            dot={{ fill: '#FF6B35', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
