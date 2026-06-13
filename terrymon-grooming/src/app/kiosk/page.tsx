'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useKioskStore } from '@/stores/kioskStore'

export default function KioskStandby() {
  const router = useRouter()
  const reset = useKioskStore(s => s.reset)

  useEffect(() => { reset() }, [reset])

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none relative p-8"
      onClick={() => router.push('/kiosk/scan')}
    >
      {/* Brand */}
      <div className="text-center mb-12">
        <div className="text-8xl mb-6 animate-bounce">🐾</div>
        <h1 className="text-white font-black text-5xl tracking-tight">TerryMon</h1>
        <p className="text-white/70 text-xl mt-2">寵物美容 · 每次都是最好的體驗</p>
      </div>

      {/* Scan prompt */}
      <div className="flex flex-col items-center gap-4">
        {/* Animated scan frame */}
        <div className="relative w-32 h-32">
          {/* Corners */}
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(pos => (
            <div
              key={pos}
              className={`absolute w-8 h-8 border-white border-4 ${
                pos === 'top-left'     ? 'top-0 left-0 border-r-0 border-b-0' :
                pos === 'top-right'    ? 'top-0 right-0 border-l-0 border-b-0' :
                pos === 'bottom-left'  ? 'bottom-0 left-0 border-r-0 border-t-0' :
                                        'bottom-0 right-0 border-l-0 border-t-0'
              }`}
            />
          ))}
          {/* Scan line */}
          <div className="absolute inset-2 overflow-hidden">
            <div className="w-full h-0.5 bg-white/80 animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>
        <p className="text-white text-xl font-medium">請點擊畫面開始報到</p>
        <p className="text-white/50 text-sm">掃描 QR Code 或輸入手機號碼</p>
      </div>

      {/* Time display */}
      <TimeDisplay />

      {/* Staff login */}
      <a
        href="/admin/login"
        onClick={e => e.stopPropagation()}
        className="absolute bottom-6 right-6 text-white/25 text-xs hover:text-white/60 transition-colors"
      >
        員工登入
      </a>
    </div>
  )
}

function TimeDisplay() {
  const now = new Date()
  const time = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
  return (
    <div className="absolute top-6 left-6 text-white/50 text-sm">
      <p className="text-3xl font-light">{time}</p>
      <p className="text-sm mt-1">{date}</p>
    </div>
  )
}
