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

type F = { email: string; password: string }

export default function VendorLogin() {
  const router = useRouter()
  const { login, isLoggedIn } = useVendorStore()

  useEffect(() => { if (isLoggedIn) router.replace('/dashboard') }, [isLoggedIn, router])

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<F>({
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: F) {
    try {
      await login(data.email, data.password)
      toast.success('登入成功')
      router.replace('/dashboard')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '登入失敗，請稍後再試')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-ink">商家登入</h1>
          <p className="text-slate-t text-sm mt-1">TerryMon 商家管理後台</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('email')} type="email" placeholder="電子信箱" className="h-12" />
          <Input {...register('password')} type="password" placeholder="密碼" className="h-12" />
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold">
            {isSubmitting ? '登入中...' : '登入'}
          </Button>
        </form>
        <p className="text-center text-xs text-slate-t mt-4">
          還沒有商家帳號？
          <Link href="/register" className="text-primary font-medium ml-1">申請進駐</Link>
        </p>
      </div>
    </div>
  )
}
