'use client'
import { useRouter } from 'next/navigation'
import { LogOut, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { CLINIC_INFO } from '@/lib/mock'
import { Button } from '@/components/ui/button'

export default function DoctorHeader() {
  const router = useRouter()
  return (
    <header className="bg-white border-b border-border-t h-14 flex items-center px-6 justify-between">
      <div className="flex items-center gap-2">
        <Stethoscope size={20} className="text-primary" />
        <span className="font-bold text-ink">{CLINIC_INFO.name}</span>
        <span className="text-slate-t text-sm ml-2">{CLINIC_INFO.doctor}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { toast.success('已登出'); router.push('/doctor/login') }}
        className="text-slate-t"
      >
        <LogOut size={16} className="mr-1" />
        登出
      </Button>
    </header>
  )
}
