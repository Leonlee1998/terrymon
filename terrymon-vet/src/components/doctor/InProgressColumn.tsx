'use client'
import { useRouter } from 'next/navigation'
import { useQueueStore } from '@/stores/queueStore'
import { Button } from '@/components/ui/button'
import { MOCK_MEDICAL } from '@/lib/mock'

export default function InProgressColumn() {
  const { inProgress } = useQueueStore()
  const router = useRouter()

  if (!inProgress) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-t bg-surface">
        <p>請叫號後開始看診</p>
      </div>
    )
  }

  const lastRecord = MOCK_MEDICAL.find(r => r.petId === inProgress.petId)

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-border-t">
        <h2 className="font-semibold">看診中</h2>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <div className="flex items-center gap-3">
          <span className="text-primary font-black text-3xl">{inProgress.queueNum}</span>
          <div>
            <p className="font-bold text-lg">{inProgress.petName}</p>
            <p className="text-sm text-slate-t">{inProgress.petBreed} · 今日體重 {inProgress.weight} kg</p>
          </div>
        </div>
        {inProgress.allergies.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            ⚠️ <strong>過敏史：</strong>{inProgress.allergies.join('、')}
          </div>
        )}
        {lastRecord && (
          <div className="bg-surface rounded-lg p-3 text-sm">
            <p className="font-semibold text-ink mb-1">最近病歷</p>
            <p className="text-slate-t">{lastRecord.date} — {lastRecord.diagnosis}</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border-t">
        <Button
          className="w-full bg-primary hover:bg-primary-hover text-white"
          onClick={() => router.push('/doctor/consult')}
        >
          開始填寫看診紀錄 →
        </Button>
      </div>
    </div>
  )
}
