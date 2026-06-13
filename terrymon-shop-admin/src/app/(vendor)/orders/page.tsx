'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Truck } from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice, formatDate } from '@/lib/utils'
import { vendorApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import type { Order, OrderStatus } from '@/types'

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待出貨', value: 'paid' },
  { label: '已出貨', value: 'shipped' },
  { label: '已送達', value: 'delivered' },
  { label: '已取消', value: 'cancelled' },
]
const STATUS_CLS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600', paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-primary-bg text-primary',
  cancelled: 'bg-red-50 text-red-600', refunding: 'bg-orange-100 text-orange-700',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '待付款', paid: '待出貨', shipped: '已出貨',
  delivered: '已送達', cancelled: '已取消', refunding: '退款中',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [shipId, setShipId] = useState<string | null>(null)
  const [trackingNum, setTrackingNum] = useState('')

  const filtered = orders.filter(o => filter === 'all' || o.status === filter)

  useEffect(() => {
    vendorApi.getOrders().then(setOrders)
  }, [])

  async function confirmShip() {
    if (!trackingNum.trim()) { toast.error('請填寫物流單號'); return }
    if (shipId) await vendorApi.updateOrderStatus(shipId, 'shipped', trackingNum)
    setOrders(prev => prev.map(o =>
      o.id === shipId ? { ...o, status: 'shipped' as const, trackingNumber: trackingNum, shippedAt: new Date().toISOString() } : o
    ))
    toast.success('已標記出貨'); setShipId(null); setTrackingNum('')
  }

  async function confirmDelivery(id: string) {
    await vendorApi.updateOrderStatus(id, 'delivered')
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'delivered' as const } : o))
    toast.success('已確認收貨')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-ink mb-6">訂單管理</h1>

      <div className="flex gap-1 bg-surface border border-border-t rounded-xl p-1 mb-4 w-fit">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === t.value ? 'bg-primary text-white' : 'text-slate-t hover:text-ink'
            }`}>
            {t.label}
            {t.value !== 'all' && (
              <span className="ml-1 text-[11px]">({orders.filter(o => o.status === t.value).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-t bg-surface">
              {['訂單號', '買家', '商品', '金額', '日期', '狀態', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-t">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-t">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <Link href={`/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{order.memberName}</p>
                  <p className="text-xs text-slate-t">{order.memberPhone}</p>
                </td>
                <td className="px-4 py-3">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center gap-2">
                      <img src={item.imageUrl} alt={item.productName} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-xs text-slate-t max-w-[120px] truncate">{item.productName} ×{item.qty}</span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 font-semibold text-primary">{formatPrice(order.vendorRevenue)}</td>
                <td className="px-4 py-3 text-xs text-slate-t">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {order.status === 'paid' && (
                    <Button size="sm" onClick={() => { setShipId(order.id); setTrackingNum('') }}
                      className="bg-primary hover:bg-primary-hover text-white gap-1 text-xs h-7">
                      <Truck size={12} /> 出貨
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button size="sm" variant="outline" onClick={() => confirmDelivery(order.id)}
                      className="text-xs h-7">確認收貨</Button>
                  )}
                  {order.status === 'delivered' && (
                    <button onClick={() => toast.info('客服功能開發中')}
                      className="text-xs text-slate-t hover:text-primary underline">申請問題</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-t text-sm">目前沒有訂單</div>
        )}
      </div>

      <Dialog open={!!shipId} onOpenChange={(o: boolean) => { if (!o) setShipId(null) }}>
        <DialogContent className="max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>填寫物流資訊</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium text-ink block">物流單號 *</label>
            <Input value={trackingNum} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrackingNum(e.target.value)}
              placeholder="例：TW123456789" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipId(null)}>取消</Button>
            <Button onClick={confirmShip} className="bg-primary text-white hover:bg-primary-hover">確認出貨</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
