'use client'
import { MOCK_VENDOR, MOCK_ORDERS, MOCK_SALES_REPORT } from '@/lib/mock'
import { formatPrice, formatDate } from '@/lib/utils'
import { TrendingUp, ShoppingBag, Package, Star } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款', paid: '待出貨', shipped: '已出貨',
  delivered: '已送達', cancelled: '已取消', refunding: '退款中',
}
const STATUS_CLS: Record<string, string> = {
  paid:      'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-primary-bg text-primary',
  cancelled: 'bg-red-50 text-red-600',
}

export default function VendorDashboard() {
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'paid').length
  const totalRevenue  = MOCK_ORDERS.filter(o => ['shipped','delivered'].includes(o.status))
    .reduce((sum, o) => sum + o.vendorRevenue, 0)

  const STATS = [
    { label: '本月營收', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-primary bg-primary-bg' },
    { label: '待出貨',   value: `${pendingOrders} 筆`,    icon: ShoppingBag, color: 'text-accent bg-accent-light' },
    { label: '上架商品', value: `${MOCK_VENDOR.totalProducts} 件`, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: '平均評分', value: '4.7 ⭐',                  icon: Star, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">數據總覽</h1>
        <p className="text-slate-t text-sm mt-0.5">{MOCK_VENDOR.storeName}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border-t p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-ink">{value}</p>
            <p className="text-xs text-slate-t mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-t p-5 mb-6">
        <h2 className="font-bold text-ink mb-4">近 7 日銷售趨勢</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={MOCK_SALES_REPORT} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4A4A4A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#4A4A4A' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E5', fontSize: 12 }}
              formatter={(v) => [formatPrice(v as number), '營收']}
            />
            <Line type="monotone" dataKey="revenue" stroke="#F28C00" strokeWidth={2.5}
                  dot={{ fill: '#F28C00', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="px-5 py-4 border-b border-border-t flex justify-between items-center">
          <h2 className="font-bold text-ink">最近訂單</h2>
          <a href="/orders" className="text-xs text-primary hover:underline">查看全部</a>
        </div>
        <div className="divide-y divide-border-t">
          {MOCK_ORDERS.slice(0, 3).map(order => (
            <div key={order.id} className="flex items-center gap-4 px-5 py-3">
              <div className="flex-1">
                <p className="font-medium text-ink text-sm">{order.memberName}</p>
                <p className="text-xs text-slate-t">{formatDate(order.createdAt)}</p>
              </div>
              <p className="text-sm font-semibold text-primary">{formatPrice(order.vendorRevenue)}</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
