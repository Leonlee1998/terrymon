'use client'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, Truck } from 'lucide-react'
import { MOCK_ORDERS } from '@/lib/mock'
import { formatPrice, formatDate } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款', paid: '待出貨', shipped: '已出貨',
  delivered: '已送達', cancelled: '已取消', refunding: '退款中',
}
const STATUS_CLS: Record<string, string> = {
  paid: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-primary-bg text-primary', cancelled: 'bg-red-50 text-red-600',
}

export default function OrderDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const order = MOCK_ORDERS.find(o => o.id === id)

  if (!order) return (
    <div className="p-6 text-slate-t">訂單不存在
      <button onClick={() => router.back()} className="text-primary underline ml-2">返回</button>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-t hover:text-primary text-sm mb-4">
        <ChevronLeft size={16} /> 返回訂單列表
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-ink">訂單 {order.id}</h1>
          <p className="text-slate-t text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border-t p-5">
          <h2 className="font-bold text-ink mb-3">買家資訊</h2>
          <p className="font-medium text-ink">{order.memberName}</p>
          <p className="text-sm text-slate-t">{order.memberPhone}</p>
          <div className="flex items-start gap-2 mt-2 text-sm text-slate-t">
            <MapPin size={14} className="mt-0.5 flex-shrink-0" />
            <span>{order.address}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border-t p-5">
          <h2 className="font-bold text-ink mb-3">商品明細</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.productId} className="flex items-center gap-3">
                <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-ink text-sm">{item.productName}</p>
                  <p className="text-xs text-slate-t">{formatPrice(item.price)} × {item.qty}</p>
                </div>
                <p className="font-semibold text-ink">{formatPrice(item.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border-t mt-4 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-slate-t">
              <span>小計</span><span>{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-t">
              <span>運費</span><span>{order.shippingFee === 0 ? '免運' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-ink pt-1 border-t border-border-t">
              <span>商家分潤</span><span className="text-primary">{formatPrice(order.vendorRevenue)}</span>
            </div>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="bg-white rounded-2xl border border-border-t p-5">
            <h2 className="font-bold text-ink mb-3">物流資訊</h2>
            <div className="flex items-center gap-2 text-sm text-slate-t">
              <Truck size={16} className="text-primary" />
              <span>物流單號：</span>
              <span className="font-mono font-semibold text-ink">{order.trackingNumber}</span>
            </div>
            {order.shippedAt && (
              <p className="text-xs text-slate-t mt-2">出貨時間：{formatDate(order.shippedAt)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
