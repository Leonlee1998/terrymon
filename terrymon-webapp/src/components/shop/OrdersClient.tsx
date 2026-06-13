'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus | 'all', string> = {
  all: '全部', pending: '待付款', paid: '已付款',
  shipped: '已出貨', delivered: '已完成', cancelled: '已取消',
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-primary-bg text-primary',
  cancelled: 'bg-gray-100 text-gray-600',
}

const FILTERS: (OrderStatus | 'all')[] = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled']

interface Props { orders: Order[] }

export default function OrdersClient({ orders }: Props) {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const router = useRouter()

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-2xl mx-auto w-full gap-3">
          <button onClick={() => router.back()} className="text-slate-t hover:text-ink transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-ink text-base flex-1">我的訂單</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex overflow-x-auto gap-1 px-4 pb-3 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface text-slate-t hover:text-ink border border-border-t'
              }`}
            >
              {STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      <div className="flex-1 p-4 space-y-3 max-w-2xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-t text-sm">沒有符合的訂單</p>
          </div>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-border-t overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-t">
                <div>
                  <p className="text-xs text-slate-t">訂單號碼</p>
                  <p className="text-sm font-semibold text-ink">{order.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <p className="text-xs text-slate-t">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Product thumbnails */}
              <div className="px-4 py-3 flex items-center gap-2">
                {order.items.slice(0, 3).map(item => (
                  <img
                    key={item.productId}
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-border-t"
                  />
                ))}
                {order.items.length > 3 && (
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border-t flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-t">+{order.items.length - 3}</span>
                  </div>
                )}
                <div className="flex-1 text-right">
                  <p className="text-xs text-slate-t">{order.items.reduce((s, i) => s + i.qty, 0)} 件</p>
                  <p className="font-bold text-primary">{formatPrice(order.totalPrice + order.shippingFee)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 pb-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/shop/orders/${order.id}`)}
                  className="text-xs h-8 border-primary text-primary hover:bg-primary-bg"
                >
                  查看詳情
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
