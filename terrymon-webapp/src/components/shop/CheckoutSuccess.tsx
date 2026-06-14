'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props { orderId: string }

export default function CheckoutSuccess({ orderId }: Props) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
      <div className="text-6xl">✅</div>
      <h1 className="text-2xl font-black text-ink">訂單已成功送出！</h1>
      <p className="text-sm text-slate-t font-mono">訂單編號：{orderId}</p>
      <p className="text-sm text-slate-t">我們會盡快為您處理，預計 2-3 個工作天出貨</p>
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => router.push('/shop/orders')}>查看訂單</Button>
        <Button className="bg-primary hover:bg-primary-hover text-white" onClick={() => router.push('/shop')}>繼續購物</Button>
      </div>
    </div>
  )
}
