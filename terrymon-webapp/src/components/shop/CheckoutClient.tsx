'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { api } from '@/services/api'
import CheckoutAddressStep, { type AddressValues } from './CheckoutAddressStep'
import CheckoutConfirmStep from './CheckoutConfirmStep'
import type { CartItem } from '@/types'

type Step = 'address' | 'confirm'

function groupByVendor(items: CartItem[]) {
  const map = new Map<string, { vendorId: string; vendorName: string; items: CartItem[] }>()
  for (const item of items) {
    const key = item.product.vendorId
    if (!map.has(key)) map.set(key, { vendorId: key, vendorName: item.product.vendorName, items: [] })
    map.get(key)!.items.push(item)
  }
  return [...map.values()]
}

export default function CheckoutClient() {
  const router = useRouter()
  const { items, totalPrice, clear } = useCartStore()
  const [step, setStep] = useState<Step>('address')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AddressValues | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('credit')

  useEffect(() => {
    if (items.length === 0 && !loading) router.replace('/shop/cart')
  }, [items.length, loading, router])

  async function handleConfirm() {
    if (!formData) return
    setLoading(true)
    try {
      const groups = groupByVendor(items)

      // 每個商家建立獨立訂單
      const orders = await Promise.all(
        groups.map(group =>
          api.placeOrder({
            items: group.items,
            vendorId: group.vendorId,
            vendorName: group.vendorName,
            recipientName: formData.recipientName,
            phone: formData.phone,
            address: formData.address,
            notes: formData.notes,
          })
        )
      )

      // 用第一筆訂單 ID 作為 ECPay 交易號（含商家數量）
      const primaryOrderId = orders[0].id
      const res = await fetch('/api/ecpay/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: primaryOrderId, paymentMethod, orderCount: orders.length }),
      })
      const data = await res.json()
      if (!res.ok || !data.params) throw new Error(data.error ?? '付款系統錯誤')

      clear()

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.actionUrl
      for (const [k, v] of Object.entries(data.params as Record<string, string>)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = k
        input.value = v
        form.appendChild(input)
      }
      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '訂單送出失敗，請再試一次')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border-t">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto w-full gap-3">
          <button
            onClick={() => step === 'address' ? router.push('/shop/cart') : setStep('address')}
            className="text-slate-t hover:text-ink transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-ink text-base flex-1">
            {step === 'address' ? '收件資訊' : '確認訂單'}
          </h1>
          <span className="text-xs text-slate-t">{step === 'address' ? '1 / 2' : '2 / 2'}</span>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {step === 'address' && (
          <CheckoutAddressStep onNext={data => { setFormData(data); setStep('confirm') }} />
        )}
        {step === 'confirm' && formData && (
          <CheckoutConfirmStep
            items={items}
            formData={formData}
            subtotal={totalPrice()}
            paymentMethod={paymentMethod}
            onPaymentChange={setPaymentMethod}
            loading={loading}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  )
}
