'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STEPS: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered']
const STEP_LABELS: Record<OrderStatus, string> = {
  pending: '待付款', paid: '已付款', shipped: '已出貨', delivered: '已完成', cancelled: '已取消',
}

interface Props { order: Order }

export default function OrderDetail({ order }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const currentStep = STEPS.indexOf(order.status as OrderStatus)

  function handleCopy() {
    if (!order.trackingNumber) return
    navigator.clipboard.writeText(order.trackingNumber).then(() => {
      setCopied(true)
      toast.success('已複製物流單號')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-2xl mx-auto w-full gap-3">
          <button
            onClick={() => router.push('/shop/orders')}
            className="text-slate-t hover:text-ink transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-ink text-base flex-1">訂單詳情</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full pb-8">
        {/* Progress bar */}
        {order.status !== 'cancelled' ? (
          <div className="bg-white rounded-2xl border border-border-t p-4">
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const done = currentStep >= i
                const isLast = i === STEPS.length - 1
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    {/* Dot */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        done
                          ? 'bg-primary border-primary text-white'
                          : 'bg-surface border-border-t text-slate-t'
                      }`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${done ? 'text-primary' : 'text-slate-t'}`}>
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                    {/* Connector */}
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${currentStep > i ? 'bg-primary' : 'bg-border-t'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl border border-border-t p-4 text-center">
            <p className="text-sm font-medium text-gray-500">此訂單已取消</p>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
          <div className="px-4 py-3 border-b border-border-t">
            <p className="text-sm font-semibold text-ink">訂購商品</p>
          </div>
          <div className="divide-y divide-border-t">
            {order.items.map(item => (
              <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-14 h-14 rounded-xl object-cover border border-border-t flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink line-clamp-2">{item.productName}</p>
                  <p className="text-xs text-slate-t mt-0.5">× {item.qty}</p>
                </div>
                <span className="text-sm font-bold text-ink flex-shrink-0">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="bg-white rounded-2xl border border-border-t p-4 space-y-2">
          <p className="text-sm font-semibold text-ink mb-3">費用明細</p>
          <div className="flex justify-between text-sm text-slate-t">
            <span>商品小計</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-t">
            <span>運費</span>
            <span>{order.shippingFee === 0 ? '免費' : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-ink pt-2 border-t border-border-t">
            <span>總計</span>
            <span className="text-primary">{formatPrice(order.totalPrice + order.shippingFee)}</span>
          </div>
        </div>

        {/* Shipping info */}
        <div className="bg-white rounded-2xl border border-border-t p-4 space-y-1.5">
          <p className="text-sm font-semibold text-ink mb-2">收件資訊</p>
          <p className="text-xs text-slate-t">訂單編號：<span className="text-ink font-medium">{order.id}</span></p>
          <p className="text-xs text-slate-t">建立時間：<span className="text-ink">{formatDate(order.createdAt, 'full')}</span></p>
          <p className="text-xs text-slate-t">收件地址：<span className="text-ink">{order.address}</span></p>
        </div>

        {/* Logistics */}
        {order.trackingNumber && (
          <div className="bg-white rounded-2xl border border-border-t p-4">
            <p className="text-sm font-semibold text-ink mb-2">物流資訊</p>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-ink">{order.trackingNumber}</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {(order.status === 'shipped' || order.status === 'delivered') && (
            <Button
              onClick={() => toast.success('確認收貨成功，感謝您的購買！')}
              className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold"
            >
              確認收貨
            </Button>
          )}
          {order.status === 'delivered' && (
            <Button
              variant="outline"
              onClick={() => toast.info('退換貨申請功能即將開放')}
              className="w-full h-11 border-slate-300 text-slate-t"
            >
              申請退換貨
            </Button>
          )}
          {order.status === 'pending' && (
            <Button
              variant="outline"
              onClick={() => toast.info('訂單已申請取消，將於 24 小時內處理')}
              className="w-full h-11 border-red-300 text-red-500 hover:bg-red-50"
            >
              取消訂單
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
