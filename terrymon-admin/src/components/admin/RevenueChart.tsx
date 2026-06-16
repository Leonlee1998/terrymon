'use client'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

export default function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  const series = data.map((d) => ({ ...d, label: d.date.slice(5) }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={series} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D8E4DC" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#5C6B5E' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 12, fill: '#5C6B5E' }} width={56}
          tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
        <Tooltip
          formatter={(v) => [`NT$ ${Number(v).toLocaleString('zh-TW')}`, '營收']}
          labelFormatter={(l) => `日期 ${l}`}
        />
        <Line type="monotone" dataKey="amount" stroke="#2B7A4B" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
