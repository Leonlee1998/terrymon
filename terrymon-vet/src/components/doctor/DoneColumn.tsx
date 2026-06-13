'use client'
import { useQueueStore } from '@/stores/queueStore'

export default function DoneColumn() {
  const { done } = useQueueStore()
  return (
    <div className="flex flex-col w-1/4 bg-surface">
      <div className="p-4 border-b border-border-t bg-white">
        <h2 className="font-semibold text-ink">
          今日完成 <span className="text-slate-t">({done.length})</span>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {done.map(item => (
          <div key={item.queueNum + item.checkinTime}
            className="bg-white rounded-lg p-3 border border-border-t text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-t">{item.queueNum}</span>
              <span className="text-xs text-slate-t">✓</span>
            </div>
            <p className="font-medium text-ink">{item.petName}</p>
            <p className="text-xs text-slate-t">{item.petBreed}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
