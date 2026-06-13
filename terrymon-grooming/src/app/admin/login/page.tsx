'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLogin() {
  const router = useRouter()
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success('登入成功')
    router.replace('/admin')
  }
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">✂️</div>
          <h1 className="text-xl font-bold">員工登入</h1>
          <p className="text-sm text-slate-t">TerryMon 美容院後台</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="電子信箱" defaultValue="admin@terrymon.com" className="h-11" />
          <Input type="password" placeholder="密碼" defaultValue="admin1234" className="h-11" />
          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white">登入</Button>
        </form>
        <p className="text-center text-xs text-slate-t mt-4">admin@terrymon.com / admin1234</p>
      </div>
    </div>
  )
}
