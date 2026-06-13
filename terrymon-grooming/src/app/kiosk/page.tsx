'use client'
import { useRouter } from 'next/navigation'
import { QrCode } from 'lucide-react'

export default function KioskStandby() {
  const router = useRouter()
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={() => router.push('/kiosk/scan')}
    >
      <div className="text-8xl mb-6 animate-bounce">🐾</div>
      <h1 className="text-white font-black text-4xl tracking-tight mb-2">TerryMon</h1>
      <p className="text-white/70 text-lg mb-12">每一位毛孩的健康燈塔</p>
      <QrCode size={64} className="text-white/50 animate-pulse mb-6" />
      <p className="text-white/80 text-xl font-medium">請點擊畫面開始報到</p>
      <a
        href="/admin/login"
        onClick={e => e.stopPropagation()}
        className="absolute bottom-6 right-6 text-white/30 text-xs hover:text-white/60"
      >
        員工登入
      </a>
    </div>
  )
}
