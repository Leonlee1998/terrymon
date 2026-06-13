'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminStore } from '@/stores/adminStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLogin() {
  const router = useRouter()
  const { login, isLoggedIn } = useAdminStore()

  useEffect(() => {
    if (isLoggedIn) router.replace('/admin')
  }, [isLoggedIn, router])

  const { register, handleSubmit } = useForm({
    defaultValues: { email: 'admin@terrymon.com', password: 'admin1234' },
  })

  function onSubmit() {
    login()
    toast.success('登入成功')
    router.replace('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-ink">員工登入</h1>
          <p className="text-slate-t text-sm mt-1">TerryMon 美容院管理後台</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('email')} type="email" placeholder="電子信箱" className="h-12" />
          <Input {...register('password')} type="password" placeholder="密碼" className="h-12" />
          <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white font-bold">
            登入
          </Button>
        </form>
        <p className="text-center text-xs text-slate-t mt-4">
          Demo：admin@terrymon.com / admin1234
        </p>
      </div>
    </div>
  )
}
