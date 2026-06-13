'use client'
import { useRouter } from 'next/navigation'
import { useQueueStore } from '@/stores/queueStore'
import { AlertTriangle } from 'lucide-react'
import { MOCK_MEDICAL } from '@/lib/mock'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default function InProgressColumn() {
  const { inProgress } = useQueueStore()
  const router = useRouter()

  if (!inProgress) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-slate-t p-8">
        <div className="text-5xl mb-4">🩺</div>
        <p className="font-medium">目前沒有正在看診的患者</p>
        <p className="text-sm mt-1">點擊「叫下一位」開始看診</p>
      </div>
    )
  }

  const lastRecord = MOCK_MEDICAL.filter(r => r.petId === inProgress.petId)[0]

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-5 py-3 border-b border-border-t flex-shrink-0">
        <h2 className="font-bold text-ink">看診中</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-primary font-black text-5xl">{inProgress.queueNum}</div>
          <div>
            <p className="text-2xl font-black text-ink">{inProgress.petName}</p>
            <p className="text-slate-t">{inProgress.petBreed}</p>
            <p className="text-slate-t text-sm">飼主：{inProgress.memberName}</p>
          </div>
        </div>

        <div className="bg-primary-bg rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-t">今日量測體重</p>
            <p className="text-3xl font-black text-primary">{inProgress.weight} kg</p>
          </div>
          <span className="text-4xl">⚖️</span>
        </div>

        {inProgress.allergies.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={18} className="text-red-600" />
              <p className="font-bold text-red-700">⚠️ 過敏史（務必注意）</p>
            </div>
            <p className="text-red-700 font-semibold">{inProgress.allergies.join('、')}</p>
          </div>
        )}

        {lastRecord && (
          <div className="bg-surface rounded-2xl p-4 border border-border-t">
            <p className="text-xs font-semibold text-slate-t mb-2">最近病歷</p>
            <p className="text-xs text-slate-t">{formatDate(lastRecord.date)}</p>
            <p className="font-semibold text-ink mt-1">{lastRecord.diagnosis}</p>
            {lastRecord.prescription.length > 0 && (
              <p className="text-xs text-slate-t mt-1">
                用藥：{lastRecord.prescription.map(r => r.medicine).join('、')}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border-t flex-shrink-0">
        <Button
          onClick={() => router.push('/doctor/consult')}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-12"
        >
          開始填寫看診紀錄 →
        </Button>
      </div>
    </div>
  )
}
