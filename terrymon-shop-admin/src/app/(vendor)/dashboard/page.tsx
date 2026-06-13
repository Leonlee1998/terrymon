'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Package, ShoppingBag, Star, TrendingUp } from 'lucide-react'
import { vendorApi } from '@/services/api'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Order, SalesReport, Vendor } from '@/types'

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '待出貨',
  shipped: '已出貨',
  delivered: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
}

const STATUS_CLS: Record<string, string> = {
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-primary-bg text-primary',
  cancelled: 'bg-red-50 text-red-600',
}

export default function VendorDashboard() {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [salesReport, setSalesReport] = useState<SalesReport[]>([])

  useEffect(() => {
    Promise.all([vendorApi.getProducts(), vendorApi.getOrders(), vendorApi.getSalesReport()])
      .then(async ([products, nextOrders, report]) => {
        setVendor(await vendorApi.getVendor(products))
        setOrders(nextOrders)
        setSalesReport(report)
      })
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'paid').length
  const totalRevenue = orders
    .filter(o => ['shipped', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + o.vendorRevenue, 0)

  const stats = [
    { label: '總營收', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-primary bg-primary-bg' },
    { label: '待出貨', value: `${pendingOrders} 筆`, icon: ShoppingBag, color: 'text-accent bg-accent-light' },
    { label: '上架商品', value: `${vendor?.totalProducts ?? 0} 件`, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: '平均評分', value: '4.7 星', icon: Star, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">商家儀表板</h1>
        <p className="text-slate-t text-sm mt-0.5">{vendor?.storeName ?? 'TerryMon Shop'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
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
        <h2 className="font-bold text-ink mb-4">近 7 日營收趨勢</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={salesReport} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4A4A4A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#4A4A4A' }} tickFormatter={v => `${(Number(v) / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #E5E5E5', fontSize: 12 }}
              formatter={(v) => [formatPrice(v as number), '營收']}
            />
            <Line type="monotone" dataKey="revenue" stroke="#F28C00" strokeWidth={2.5} dot={{ fill: '#F28C00', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="px-5 py-4 border-b border-border-t flex justify-between items-center">
          <h2 className="font-bold text-ink">近期訂單</h2>
          <Link href="/orders" className="text-xs text-primary hover:underline">查看全部</Link>
        </div>
        <div className="divide-y divide-border-t">
          {orders.slice(0, 3).map(order => (
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
