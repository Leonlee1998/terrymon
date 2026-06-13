'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stethoscope } from 'lucide-react'

export default function DoctorLogin() {
  const router = useRouter()
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success('登入成功')
    router.replace('/doctor')
  }
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
        <div className="text-center mb-6">
          <Stethoscope size={40} className="text-primary mx-auto mb-2" />
          <h1 className="text-xl font-bold">醫師登入</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="電子信箱" defaultValue="doctor@terrymon.com" className="h-11" />
          <Input type="password" placeholder="密碼" defaultValue="doctor1234" className="h-11" />
          <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white">登入</Button>
        </form>
        <p className="text-center text-xs text-slate-t mt-4">doctor@terrymon.com / doctor1234</p>
      </div>
    </div>
  )
}
