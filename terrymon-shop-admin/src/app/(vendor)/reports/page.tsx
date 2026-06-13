'use client'
import { MOCK_SALES_REPORT, MOCK_PRODUCTS, MOCK_ORDERS } from '@/lib/mock'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const totalRevenue = MOCK_SALES_REPORT.reduce((s, r) => s + r.revenue, 0)
const totalOrders  = MOCK_SALES_REPORT.reduce((s, r) => s + r.orders, 0)
const avgOrder     = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

const productRanking = [...MOCK_PRODUCTS]
  .sort((a, b) => b.totalSold - a.totalSold)
  .map(p => ({ name: p.name.slice(0, 12), totalSold: p.totalSold }))

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">銷售報表</h1>
        <p className="text-slate-t text-sm mt-0.5">近 7 日銷售數據總覽</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '總營收', value: formatPrice(totalRevenue) },
          { label: '訂單數', value: `${totalOrders} 筆` },
          { label: '平均客單價', value: formatPrice(avgOrder) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-border-t p-4 text-center">
            <p className="text-2xl font-black text-primary">{value}</p>
            <p className="text-sm text-slate-t mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-t p-5">
        <h2 className="font-bold text-ink mb-4">營收趨勢</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MOCK_SALES_REPORT} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4A4A4A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#4A4A4A' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E5', fontSize: 12 }}
              formatter={(v) => [formatPrice(v as number), '營收']} />
            <Line type="monotone" dataKey="revenue" stroke="#F28C00" strokeWidth={2.5}
              dot={{ fill: '#F28C00', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-border-t p-5">
        <h2 className="font-bold text-ink mb-4">每日訂單數</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MOCK_SALES_REPORT} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4A4A4A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#4A4A4A' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E5', fontSize: 12 }}
              formatter={(v) => [v as number, '訂單數']} />
            <Bar dataKey="orders" fill="#F28C00" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-border-t p-5">
        <h2 className="font-bold text-ink mb-4">商品銷售排行</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart layout="vertical" data={productRanking} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#4A4A4A' }} />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#4A4A4A' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E5', fontSize: 12 }}
              formatter={(v) => [v as number, '已售']} />
            <Bar dataKey="totalSold" fill="#FFAA33" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="px-5 py-4 border-b border-border-t">
          <h2 className="font-bold text-ink">銷售明細</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-t bg-surface">
              {['日期', '訂單數', '銷售額', '銷售件數', '平均客單價'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-t">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-t">
            {MOCK_SALES_REPORT.map(r => (
              <tr key={r.date} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-ink">{r.date}</td>
                <td className="px-4 py-3 text-slate-t">{r.orders}</td>
                <td className="px-4 py-3 font-semibold text-primary">{formatPrice(r.revenue)}</td>
                <td className="px-4 py-3 text-slate-t">{r.units}</td>
                <td className="px-4 py-3 text-slate-t">{formatPrice(Math.round(r.revenue / r.orders))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
