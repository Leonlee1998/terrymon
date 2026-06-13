'use client'

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HealthDataPoint } from '@/types'

interface Props {
  sys: HealthDataPoint[]
  dia: HealthDataPoint[]
}

export default function BloodPressureChart({ sys, dia }: Props) {
  const chartData = sys.map((point, index) => ({
    date: new Date(point.timestamp).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
    sys: point.value,
    dia: dia[index]?.value,
  }))
  const latestSys = sys.at(-1)
  const latestDia = dia.at(-1)

  return (
    <div className="rounded-3xl border border-[#eadfd2] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-ink">血壓趨勢</h4>
          {latestSys && latestDia && (
            <p className="mt-0.5 text-xs text-slate-t">
              最新 <span className="font-bold text-primary">{latestSys.value}/{latestDia.value} mmHg</span>
            </p>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eadfd2" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5C6B5E' }} />
          <YAxis
            tick={{ fontSize: 10, fill: '#5C6B5E' }}
            domain={['auto', 'auto']}
            tickFormatter={value => `${value}`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #eadfd2', fontSize: 12 }}
            formatter={(value, name) => [
              `${value ?? '-'} mmHg`,
              name === 'sys' ? '收縮壓' : '舒張壓',
            ]}
          />
          <Legend
            formatter={value => value === 'sys' ? '收縮壓' : '舒張壓'}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="sys"
            name="sys"
            stroke="#2B7A4B"
            strokeWidth={2.5}
            dot={{ fill: '#2B7A4B', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="dia"
            name="dia"
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
