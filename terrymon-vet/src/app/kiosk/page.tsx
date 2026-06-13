'use client'
import { useRouter } from 'next/navigation'
import { Stethoscope } from 'lucide-react'

export default function KioskStandby() {
  const router = useRouter()
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none relative"
      onClick={() => router.push('/kiosk/scan')}
    >
      <div className="text-8xl mb-6">🐾</div>
      <h1 className="text-white font-black text-4xl mb-2">TerryMon 動物醫院</h1>
      <p className="text-white/70 text-lg mb-12">您的毛孩健康，我們的責任</p>
      <Stethoscope size={64} className="text-white/50 animate-pulse mb-6" />
      <p className="text-white/80 text-xl font-medium">請點擊畫面完成掛號</p>
      <a
        href="/doctor/login"
        onClick={e => e.stopPropagation()}
        className="absolute bottom-6 right-6 text-white/30 text-xs hover:text-white/60"
      >
        醫師登入
      </a>
    </div>
  )
}
