'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { CLINIC_INFO } from '@/lib/mock'

export default function KioskStandby() {
  const router = useRouter()
  const reset = useKioskStore(s => s.reset)

  useEffect(() => { reset() }, [reset])

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none relative p-8"
      onClick={() => router.push('/kiosk/scan')}
    >
      {/* Clinic info top-left */}
      <div className="absolute top-6 left-6 text-white/60 text-sm">
        <p className="font-semibold text-white">{CLINIC_INFO.name}</p>
        <p>{CLINIC_INFO.phone}</p>
      </div>

      {/* Brand */}
      <div className="text-center mb-12">
        <div className="text-8xl mb-6 animate-bounce">🐾</div>
        <h1 className="text-white font-black text-5xl tracking-tight">TerryMon</h1>
        <p className="text-white/70 text-xl mt-2">動物醫院 · 您的毛孩健康，我們的責任</p>
      </div>

      {/* Prompt */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center">
          <Stethoscope size={40} className="text-white animate-pulse" />
        </div>
        <p className="text-white text-xl font-medium">請點擊畫面完成掛號</p>
        <p className="text-white/50 text-sm">掃描 QR Code 或輸入手機號碼</p>
      </div>

      {/* Doctor login */}
      <a
        href="/doctor/login"
        onClick={e => e.stopPropagation()}
        className="absolute bottom-6 right-6 text-white/25 text-xs hover:text-white/60 transition-colors"
      >
        醫師登入
      </a>
    </div>
  )
}
