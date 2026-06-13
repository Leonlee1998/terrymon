'use client'
import { useQueueStore } from '@/stores/queueStore'

export default function DoneColumn() {
  const { done } = useQueueStore()

  return (
    <div className="w-1/4 flex flex-col bg-surface">
      <div className="px-4 py-3 bg-white border-b border-border-t flex-shrink-0">
        <h2 className="font-bold text-ink">
          今日完成
          <span className="ml-2 text-sm font-normal text-slate-t">({done.length})</span>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {done.length === 0 ? (
          <p className="text-center text-slate-t text-sm pt-8">今日尚無完成紀錄</p>
        ) : (
          done.map(item => (
            <div key={item.queueNum + item.checkinTime}
                 className="bg-white rounded-xl border border-border-t p-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-t font-bold text-sm">{item.queueNum}</span>
                <span className="text-xs text-green-600 font-medium">✓ 完成</span>
              </div>
              <p className="font-medium text-ink text-sm mt-1">{item.petName}</p>
              <p className="text-xs text-slate-t">{item.petBreed}</p>
              {item.consultation && (
                <p className="text-xs text-slate-t mt-1 truncate">{item.consultation.diagnosis}</p>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  )
}
