'use client'

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HealthDataPoint } from '@/types'

interface Props {
  data: HealthDataPoint[]
  compact?: boolean
}

export default function BloodSugarChart({ data, compact = false }: Props) {
  const chartData = data.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
    value: point.value,
  }))
  const latest = data.at(-1)
  const isHigh = Boolean(latest && latest.value > 6.1)

  return (
    <div className="rounded-3xl border border-[#eadfd2] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-ink">血糖趨勢</h4>
          {latest && (
            <p className="mt-0.5 text-xs text-slate-t">
              最新 <span className={`font-bold ${isHigh ? 'text-red-500' : 'text-primary'}`}>{latest.value} mmol/L</span>
            </p>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={compact ? 120 : 200}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eadfd2" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5C6B5E' }} />
          <YAxis tick={{ fontSize: 10, fill: '#5C6B5E' }} domain={['auto', 'auto']} tickFormatter={value => `${value} mmol`} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #eadfd2', fontSize: 12 }}
            formatter={value => [`${value ?? '-'} mmol/L`, '血糖']}
          />
          <ReferenceLine
            y={6.1}
            stroke="#EF4444"
            strokeDasharray="4 4"
            label={{ value: '偏高線', position: 'right', fontSize: 10, fill: '#EF4444' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00B8D9"
            strokeWidth={2.5}
            dot={{ fill: '#00B8D9', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
