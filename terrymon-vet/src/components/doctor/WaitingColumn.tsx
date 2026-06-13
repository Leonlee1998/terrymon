'use client'
import { useQueueStore } from '@/stores/queueStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function WaitingColumn() {
  const { waiting, callNext } = useQueueStore()

  function handleCallNext() {
    if (!waiting.length) return
    const next = waiting[0]
    callNext()
    toast.success(`已叫號 ${next.queueNum}`)
  }

  return (
    <div className="flex flex-col w-1/3">
      <div className="p-4 border-b border-border-t bg-white">
        <h2 className="font-semibold text-ink">候診中 <span className="text-primary">({waiting.length})</span></h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-surface">
        {waiting.map(item => (
          <div key={item.queueNum} className="bg-white rounded-xl p-3 border border-border-t">
            <div className="flex items-center justify-between mb-1">
              <span className="text-primary font-bold text-lg">{item.queueNum}</span>
              <span className="text-xs text-slate-t">{item.checkinTime}</span>
            </div>
            <p className="font-medium text-ink">{item.petName}</p>
            <p className="text-sm text-slate-t">{item.petBreed} · {item.weight} kg</p>
            <p className="text-xs text-slate-t mt-1">飼主：{item.memberName}</p>
            {item.allergies.length > 0 && (
              <span className="inline-block mt-1 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                ⚠️ {item.allergies.join('、')}
              </span>
            )}
          </div>
        ))}
        {waiting.length === 0 && (
          <p className="text-center text-slate-t py-8">今日候診已全部完成</p>
        )}
      </div>
      <div className="p-3 border-t border-border-t bg-white">
        <Button
          className="w-full bg-primary hover:bg-primary-hover text-white"
          onClick={handleCallNext}
          disabled={waiting.length === 0}
        >
          叫下一位 →
        </Button>
      </div>
    </div>
  )
}
