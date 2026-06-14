'use client'
import { useRouter } from 'next/navigation'
import { LogOut, PawPrint, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { CLINIC_INFO } from '@/lib/mock'
import { Button } from '@/components/ui/button'

export default function DoctorHeader() {
  const router = useRouter()
  return (
    <header className="bg-white border-b border-border-t h-14 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <PawPrint size={20} className="text-primary" />
          <span className="font-bold text-ink">預約怪獸</span>
        </div>
        <span className="text-border-t">|</span>
        <div className="flex items-center gap-1.5">
          <Stethoscope size={15} className="text-slate-t" />
          <span className="text-sm text-slate-t">{CLINIC_INFO.name}・{CLINIC_INFO.doctor}</span>
        </div>
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
