'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useKioskStore } from '@/stores/kioskStore'

export default function KioskComplete() {
  const router = useRouter()
  const { signatureData, selectedMain, selectedAddons, totalPrice, totalDuration, reset } = useKioskStore()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!signatureData) { router.replace('/kiosk'); return }
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(id)
          reset()
          router.replace('/kiosk')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [signatureData, router, reset])

  if (!signatureData || !selectedMain) return null

  const allServices = [selectedMain, ...selectedAddons]

  function handleReturn() {
    reset()
    router.replace('/kiosk')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <style>{`
        @keyframes pop {
          0%   { scale: 0 }
          80%  { scale: 1.15 }
          100% { scale: 1 }
        }
      `}</style>

      {/* Success icon */}
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-6"
           style={{ animation: 'pop 0.5s ease-out' }}>
        <span className="text-white text-5xl font-black">✓</span>
      </div>

      <h1 className="text-3xl font-black text-primary mb-2">服務確認完成！</h1>
      <p className="text-slate-400 mb-8">感謝您的光臨 🐾</p>

      {/* Summary card */}
      <div className="bg-primary-bg rounded-2xl p-5 w-full max-w-sm text-left mb-6">
        <div className="space-y-1 mb-4">
          {allServices.map(s => (
            <p key={s.id} className="text-sm text-ink">✓ {s.name}</p>
          ))}
        </div>
        <p className="font-bold text-ink">總費用：NT$ {totalPrice()}</p>
        <p className="text-sm text-slate-500 mt-0.5">預計時間：約 {totalDuration()} 分鐘</p>
      </div>

      <p className="text-xs text-slate-400 mb-8">合約已傳送至您的手機 App 及 LINE</p>

      {/* Countdown bar */}
      <div className="w-full max-w-sm mb-2">
        <div className="bg-border-t rounded-full h-1.5 w-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-1000"
            style={{ width: `${countdown * 10}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">{countdown} 秒後自動返回</p>

      <Button variant="outline" onClick={handleReturn}>
        立即返回
      </Button>
    </div>
  )
}
