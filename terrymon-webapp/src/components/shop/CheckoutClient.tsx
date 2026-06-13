'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { api } from '@/services/api'

const schema = z.object({
  recipientName: z.string().min(2, '請填寫收件人姓名'),
  phone:         z.string().min(10, '請填寫正確手機號碼'),
  address:       z.string().min(10, '請填寫完整地址'),
  notes:         z.string().optional(),
})
type FormValues = z.infer<typeof schema>

type Step = 'address' | 'confirm' | 'success'

const PAYMENT_OPTIONS = [
  { id: 'credit', label: '信用卡', desc: 'Visa · Mastercard · JCB' },
  { id: 'atm',    label: 'ATM 轉帳', desc: '各大銀行均可使用' },
  { id: 'cvs',    label: '超商取貨付款', desc: '7-11、全家、萊爾富' },
  { id: 'cod',    label: '貨到付款', desc: '收貨時付現' },
]

export default function CheckoutClient() {
  const router = useRouter()
  const { items, totalPrice, clear } = useCartStore()
  const [step, setStep] = useState<Step>('address')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [formData, setFormData] = useState<FormValues | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { recipientName: '', phone: '', address: '', notes: '' },
  })

  useEffect(() => {
    if (items.length === 0 && step !== 'success') router.replace('/shop/cart')
  }, [items.length, step, router])

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await api.placeOrder({
        items,
        recipientName: formData?.recipientName,
        phone: formData?.phone,
        address: formData?.address,
        notes: formData?.notes,
      })
      clear()
      setOrderId(res.id)
      setStep('success')
    } catch {
      toast.error('訂單送出失敗，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 1: Address ── */
  if (step === 'address') {
    return (
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <h1 className="font-bold text-lg text-ink">填寫收件資訊</h1>
        <form onSubmit={handleSubmit(data => { setFormData(data); setStep('confirm') })} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">收件人姓名</label>
            <Input {...register('recipientName')} placeholder="王小明" />
            {errors.recipientName && <p className="text-xs text-error mt-1">{errors.recipientName.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">手機號碼</label>
            <Input {...register('phone')} placeholder="0912-345-678" type="tel" />
            {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">收件地址</label>
            <Textarea {...register('address')} placeholder="台北市大安區忠孝東路四段100號" rows={3} />
            {errors.address && <p className="text-xs text-error mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">備注（選填）</label>
            <Input {...register('notes')} placeholder="如：請放門口" />
          </div>
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary-hover text-white">
            下一步：確認訂單
          </Button>
        </form>
      </div>
    )
  }

  /* ── Step 2: Confirm ── */
  if (step === 'confirm') {
    const shipping = totalPrice() >= 1000 ? 0 : 60
    return (
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <button onClick={() => setStep('address')} className="flex items-center gap-1 text-slate-t text-sm hover:text-ink">
          <ChevronLeft size={16} />返回修改
        </button>
        <h1 className="font-bold text-lg text-ink">確認訂單</h1>

        {/* Items */}
        <div className="bg-white rounded-xl border border-border-t p-4 space-y-3">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-3 items-center">
              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink line-clamp-1">{product.name}</p>
                <p className="text-xs text-slate-t">× {qty}</p>
              </div>
              <span className="text-sm font-medium shrink-0">{formatPrice(product.price * qty)}</span>
            </div>
          ))}
        </div>

        {/* Shipping info */}
        <div className="bg-white rounded-xl border border-border-t p-4 text-sm space-y-1">
          <p className="font-semibold text-ink mb-2">收件資訊</p>
          <p className="text-slate-t">{formData?.recipientName}・{formData?.phone}</p>
          <p className="text-slate-t">{formData?.address}</p>
        </div>

        {/* Fee */}
        <div className="bg-white rounded-xl border border-border-t p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-t">商品小計</span><span>{formatPrice(totalPrice())}</span></div>
          <div className="flex justify-between"><span className="text-slate-t">運費</span><span>{shipping === 0 ? '免運' : formatPrice(shipping)}</span></div>
          <div className="flex justify-between font-bold border-t border-border-t pt-2 text-base">
            <span>總計</span><span className="text-primary">{formatPrice(totalPrice() + shipping)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-border-t p-4 text-sm">
          <p className="font-semibold text-ink mb-3">付款方式</p>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map(opt => (
              <label
                key={opt.id}
                className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors"
                style={{ borderColor: paymentMethod === opt.id ? 'var(--color-primary)' : 'var(--color-border-t)' }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={opt.id}
                  checked={paymentMethod === opt.id}
                  onChange={() => setPaymentMethod(opt.id)}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-ink">{opt.label}</p>
                  <p className="text-xs text-slate-t">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary-hover text-white"
        >
          {loading ? '送出中…' : '確認送出訂單'}
        </Button>
      </div>
    )
  }

  /* ── Step 3: Success ── */
  return (
    <div className="px-4 py-16 max-w-lg mx-auto text-center space-y-4">
      <div className="text-6xl animate-[pop_0.5s_ease-out]">✅</div>
      <h1 className="text-2xl font-black text-ink">訂單已成功送出！</h1>
      <p className="text-sm text-slate-t font-mono">訂單編號：{orderId}</p>
      <p className="text-sm text-slate-t">我們會盡快為您處理，預計 2-3 個工作天出貨</p>
      <div className="flex gap-3 justify-center pt-4">
        <Button variant="outline" onClick={() => router.push('/shop/orders')}>查看訂單</Button>
        <Button className="bg-primary hover:bg-primary-hover text-white" onClick={() => router.push('/shop')}>繼續購物</Button>
      </div>
    </div>
  )
}
