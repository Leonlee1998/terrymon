'use client'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import type { RevenueBreakdownDay } from '@/types'

const fmt = (v: number) => `NT$ ${v.toLocaleString('zh-TW')}`
const shortFmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)

const SERIES = [
  { key: 'service', label: '服務消費', color: '#2B7A4B' },
  { key: 'order',   label: '商城消費', color: '#0EA5E9' },
  { key: 'topup',   label: '儲值',     color: '#F59E0B' },
  { key: 'refund',  label: '退款',     color: '#EF4444' },
] as const

export function RevenueBreakdownChart({ data }: { data: RevenueBreakdownDay[] }) {
  const series = data.map(d => ({ ...d, label: d.date.slice(5) }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={series} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <defs>
          {SERIES.map(s => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#D8E4DC" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5C6B5E' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#5C6B5E' }} width={52} tickFormatter={shortFmt} />
        <Tooltip formatter={(v, name) => [fmt(Number(v)), name]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map(s => (
          <Area
            key={s.key} type="monotone" dataKey={s.key} name={s.label}
            stroke={s.color} strokeWidth={s.key === 'refund' ? 1.5 : 2}
            strokeDasharray={s.key === 'refund' ? '4 2' : undefined}
            fill={`url(#grad-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MemberGrowthChart({ data }: { data: { date: string; count: number }[] }) {
  const series = data.map(d => ({ ...d, label: d.date.slice(5) }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D8E4DC" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5C6B5E' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#5C6B5E' }} width={36} allowDecimals={false} />
        <Tooltip formatter={(v) => [v, '新增會員']} />
        <Line type="monotone" dataKey="count" stroke="#2B7A4B" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
