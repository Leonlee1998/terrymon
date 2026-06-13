'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { SHOP_INFO } from '@/lib/mock'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DoctorLogin() {
  const router = useRouter()
  const { register, handleSubmit } = useForm({
    defaultValues: { email: 'groomer@terrymon.com', password: 'groomer1234' },
  })

  function onSubmit() {
    toast.success('登入成功')
    router.replace('/doctor')
  }

  return (
    <div className="flex-1 bg-primary-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-ink">美容師登入</h1>
          <p className="text-slate-t text-sm mt-1">{SHOP_INFO.name}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('email')} type="email" placeholder="美容師帳號" className="h-12" />
          <Input {...register('password')} type="password" placeholder="密碼" className="h-12" />
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold">
            登入
          </Button>
        </form>
        <p className="text-center text-xs text-slate-t mt-4">
          groomer@terrymon.com / groomer1234
        </p>
      </div>
    </div>
  )
}
