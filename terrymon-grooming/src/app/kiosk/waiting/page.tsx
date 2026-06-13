'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useKioskStore } from '@/stores/kioskStore'
import { useQueueStore } from '@/stores/queueStore'
import { Button } from '@/components/ui/button'

export default function KioskWaiting() {
  const router = useRouter()
  const { member, selectedPet, weight, queueNum, reset } = useKioskStore()
  const { waiting, checkoutReady, clearCheckout } = useQueueStore()

  useEffect(() => {
    if (!queueNum) router.replace('/kiosk')
  }, [queueNum, router])

  useEffect(() => {
    if (checkoutReady === queueNum) {
      clearCheckout()
      router.push('/kiosk/checkout')
    }
  }, [checkoutReady, queueNum, clearCheckout, router])

  if (!member || !selectedPet || !queueNum) return null

  const waitingCount = waiting.length
  const estimatedMin = waitingCount * 15

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-primary-bg">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-xl mb-6">
        <p className="text-sm text-slate-t font-medium mb-2">您的候診號碼</p>
        <div className="text-[96px] font-black text-primary leading-none tracking-tight">
          {queueNum}
        </div>
        <p className="text-slate-t mt-2">掛號完成</p>
      </div>

      <div className="bg-white rounded-2xl border border-border-t p-5 w-full max-w-md mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-ink">{waitingCount > 0 ? 'A001' : '輪到您'}</p>
            <p className="text-xs text-slate-t mt-1">目前看診</p>
          </div>
          <div>
            <p className="text-2xl font-black text-ink">{waitingCount}</p>
            <p className="text-xs text-slate-t mt-1">前方等候</p>
          </div>
          <div>
            <p className="text-2xl font-black text-ink">~{estimatedMin}</p>
            <p className="text-xs text-slate-t mt-1">預計等待（分）</p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(waitingCount + 1, 5) }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === 0 ? 'bg-primary' : 'bg-border-t'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-t px-4 py-3 w-full max-w-md mb-6 flex items-center gap-3">
        <img src={selectedPet.photoUrl} alt={selectedPet.name}
             className="w-10 h-10 rounded-xl object-cover" />
        <div className="flex-1">
          <p className="font-semibold text-ink text-sm">{selectedPet.name}</p>
          <p className="text-xs text-slate-t">{weight} kg · {selectedPet.breed}</p>
        </div>
        <p className="text-xs text-slate-t">{member.name}</p>
      </div>

      <p className="text-sm text-slate-t text-center mb-6 max-w-xs">
        看診完成後，請憑此號碼回到此台領取藥單與收據
      </p>

      <button
        onClick={() => router.push('/kiosk/checkout')}
        className="text-xs text-slate-t/50 hover:text-slate-t underline mb-4"
      >
        （Demo 用）模擬看診完成 →
      </button>

      <Button
        variant="outline"
        onClick={() => { reset(); router.replace('/kiosk') }}
        className="border-border-t text-slate-t"
      >
        返回首頁
      </Button>
    </div>
  )
}
