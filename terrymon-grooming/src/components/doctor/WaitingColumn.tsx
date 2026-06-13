'use client'
import { useQueueStore } from '@/stores/queueStore'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function WaitingColumn() {
  const { waiting, callNext } = useQueueStore()

  function handleCallNext() {
    if (!waiting.length) return
    const next = waiting[0]
    callNext()
    toast.success(`已叫號 ${next.queueNum} — ${next.petName}`)
  }

  return (
    <div className="w-1/3 flex flex-col bg-surface">
      <div className="px-4 py-3 bg-white border-b border-border-t flex items-center justify-between flex-shrink-0">
        <h2 className="font-bold text-ink">
          等候美容
          <span className="ml-2 text-sm font-normal text-slate-t">({waiting.length})</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {waiting.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-t">
            <p className="text-sm">候診隊列為空</p>
          </div>
        ) : (
          waiting.map((item) => (
            <div
              key={item.queueNum}
              className="bg-white rounded-xl border border-border-t p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-primary font-black text-xl">{item.queueNum}</span>
                <span className="text-xs text-slate-t">{item.checkinTime}</span>
              </div>
              <p className="font-semibold text-ink">{item.petName}</p>
              <p className="text-xs text-slate-t">{item.petBreed} · {item.weight} kg</p>
              <p className="text-xs text-slate-t">飼主：{item.memberName}</p>
              {item.allergies.length > 0 && (
                <div className="flex items-center gap-1 mt-2 bg-red-50 rounded-lg px-2 py-1">
                  <AlertTriangle size={12} className="text-red-600" />
                  <span className="text-[11px] text-red-700 font-medium">
                    過敏：{item.allergies.join('、')}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border-t bg-white flex-shrink-0">
        <Button
          onClick={handleCallNext}
          disabled={waiting.length === 0}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold disabled:opacity-40"
        >
          叫下一位 →
        </Button>
      </div>
    </div>
  )
}
