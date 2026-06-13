'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Store } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function VendorLogin() {
  const router = useRouter()
  const { login, isLoggedIn } = useVendorStore()

  useEffect(() => { if (isLoggedIn) router.replace('/dashboard') }, [isLoggedIn, router])

  const { register, handleSubmit } = useForm({
    defaultValues: { email: 'vendor@example.com', password: 'vendor1234' },
  })

  function onSubmit() { login(); toast.success('登入成功'); router.replace('/dashboard') }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-ink">商家登入</h1>
          <p className="text-slate-t text-sm mt-1">TerryMon 商城管理後台</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('email')} type="email" placeholder="電子信箱" className="h-12" />
          <Input {...register('password')} type="password" placeholder="密碼" className="h-12" />
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold">
            登入
          </Button>
        </form>
        <p className="text-center text-xs text-slate-t mt-4">
          還沒有帳號？
          <Link href="/register" className="text-primary font-medium ml-1">申請入駐</Link>
        </p>
        <p className="text-center text-xs text-slate-t mt-2">Demo：vendor@example.com / vendor1234</p>
      </div>
    </div>
  )
}
