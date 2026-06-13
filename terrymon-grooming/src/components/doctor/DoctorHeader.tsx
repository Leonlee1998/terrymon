'use client'
import { useRouter } from 'next/navigation'
import { LogOut, Stethoscope, Monitor } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CLINIC_INFO } from '@/lib/mock'

export default function DoctorHeader() {
  const router = useRouter()
  return (
    <header className="bg-white border-b border-border-t h-14 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex items-center gap-2 flex-1">
        <Stethoscope size={20} className="text-primary" />
        <div>
          <span className="font-bold text-ink">{CLINIC_INFO.name}</span>
          <span className="text-slate-t text-sm ml-3">{CLINIC_INFO.doctor}</span>
        </div>
      </div>
      <Link
        href="/kiosk"
        className="flex items-center gap-1.5 text-sm text-slate-t hover:text-primary transition-colors border border-border-t rounded-lg px-3 py-1.5"
      >
        <Monitor size={14} />
        前台 Kiosk
      </Link>
      <button
        onClick={() => { toast.success('已登出'); router.push('/doctor/login') }}
        className="flex items-center gap-1.5 text-sm text-slate-t hover:text-red-600 transition-colors"
      >
        <LogOut size={16} />
        登出
      </button>
    </header>
  )
}
