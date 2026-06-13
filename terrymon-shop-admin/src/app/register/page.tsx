'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Store, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type RegisterForm = {
  storeName: string; ownerName: string; email: string; phone: string
  taxId: string; bankAccount: string; description: string; agreed: boolean
}

export default function VendorRegister() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { agreed: false },
  })

  function onSubmit() {
    toast.success('申請已送出，審核時間約 3-5 個工作天')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-surface py-10 px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/login" className="flex items-center gap-1 text-slate-t hover:text-primary text-sm mb-6">
          <ChevronLeft size={16} /> 返回登入
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
            <Store size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink">申請入駐</h1>
            <p className="text-slate-t text-sm">TerryMon 商城商家入駐申請</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">店家名稱 *</label>
              <Input {...register('storeName', { required: true })} placeholder="汪喵鮮食" />
              {errors.storeName && <p className="text-xs text-error mt-1">必填</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">負責人姓名 *</label>
              <Input {...register('ownerName', { required: true })} placeholder="王小明" />
              {errors.ownerName && <p className="text-xs text-error mt-1">必填</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink mb-1 block">電子信箱 *</label>
            <Input {...register('email', { required: true })} type="email" placeholder="vendor@example.com" />
          </div>

          <div>
            <label className="text-sm font-medium text-ink mb-1 block">聯絡電話 *</label>
            <Input {...register('phone', { required: true })} placeholder="0912-111-222" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">統一編號</label>
              <Input {...register('taxId')} placeholder="12345678" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">銀行帳號</label>
              <Input {...register('bankAccount')} placeholder="012-000-123456" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink mb-1 block">店家介紹</label>
            <Textarea {...register('description')} placeholder="介紹您的商店特色、主要商品..." rows={4} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input {...register('agreed', { required: true })} type="checkbox"
                   className="mt-0.5 h-4 w-4 rounded border-border-t text-primary" />
            <span className="text-sm text-slate-t">
              我同意 TerryMon 商城
              <span className="text-primary"> 商家服務條款</span>及
              <span className="text-primary"> 隱私政策</span>
            </span>
          </label>
          {errors.agreed && <p className="text-xs text-error">請同意服務條款</p>}

          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold mt-2">
            送出申請
          </Button>
        </form>
      </div>
    </div>
  )
}
