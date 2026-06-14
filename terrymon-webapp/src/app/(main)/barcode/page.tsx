'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Barcode from 'react-barcode'
import { useAuthStore } from '@/stores/authStore'

export default function BarcodePage() {
  const { member, isLoggedIn } = useAuthStore()
  const router = useRouter()
  const barcodeValue = member?.handle ? `TM-${member.handle}` : null

  // Attempt to keep screen awake while showing barcode
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    navigator.wakeLock.request('screen').then(l => { lock = l }).catch(() => {})
    return () => { lock?.release().catch(() => {}) }
  }, [])

  if (!isLoggedIn || !member) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-border-t px-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-slate-400 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-ink">我的會員條碼</h1>
      </div>

      {/* Barcode area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
        <div className="text-center">
          <p className="text-lg font-bold text-ink">{member.name}</p>
          {member.handle && (
            <p className="text-sm font-medium text-card-teal">TM-{member.handle}</p>
          )}
        </div>

        {barcodeValue ? (
          <div className="rounded-2xl border border-border-t bg-white p-6 shadow-sm">
            <Barcode
              value={barcodeValue}
              lineColor="#1A1D1A"
              background="#ffffff"
              width={2.2}
              height={100}
              displayValue={false}
              margin={0}
            />
            <p className="mt-3 text-center text-sm font-bold tracking-widest text-ink">{barcodeValue}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-t p-8 text-center text-sm text-slate-t">
            請先至<strong>會員中心</strong>設定你的會員 ID
          </div>
        )}

        <p className="text-center text-xs text-slate-t">將條碼對準掃描器，輕觸即可報到</p>
      </div>
    </div>
  )
}
