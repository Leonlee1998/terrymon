'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useKioskStore } from '@/stores/kioskStore'
import { MOCK_QUEUE } from '@/lib/mock'

const waitingCount = MOCK_QUEUE.filter(q => q.status === 'waiting').length

export default function KioskWaiting() {
  const router = useRouter()
  const { queueNum, selectedPet, weight, reset } = useKioskStore()

  useEffect(() => {
    if (!queueNum) router.replace('/kiosk')
  }, [queueNum, router])

  if (!queueNum) return null

  const now = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex-1 flex flex-col bg-primary-bg px-6 py-10 gap-6">
      {/* Title */}
      <p className="text-primary font-black text-2xl text-center">掛號完成！</p>

      {/* Queue number */}
      <div className="text-[120px] font-black text-primary leading-none text-center animate-[pop_0.5s_ease-out]">
        {queueNum}
      </div>

      {/* Queue info card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-t">目前看診</span>
          <span className="font-semibold text-ink">A001</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-t">前方還有</span>
          <span className="font-semibold text-ink">{waitingCount} 組</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-t">預計等待</span>
          <span className="font-semibold text-ink">約 {waitingCount * 10} 分鐘</span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-2 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-border-t'}`}
            />
          ))}
        </div>
      </div>

      {/* Pet recap */}
      {selectedPet && (
        <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between text-sm shadow-sm">
          <span className="font-medium text-ink">{selectedPet.name}</span>
          <span className="text-slate-t">{weight} kg</span>
          <span className="text-slate-t">掛號 {now}</span>
        </div>
      )}

      {/* Info text */}
      <p className="text-sm text-slate-t text-center">
        看診完成後，請回到此台領取藥單與收據
      </p>

      {/* Demo button */}
      <Button
        variant="outline"
        size="sm"
        className="mx-auto"
        onClick={() => router.push('/kiosk/checkout')}
      >
        模擬看診完成
      </Button>

      {/* Home button */}
      <Button
        variant="outline"
        className="border-primary text-primary hover:bg-primary-bg"
        onClick={() => { reset(); router.replace('/kiosk') }}
      >
        返回首頁
      </Button>
    </div>
  )
}
