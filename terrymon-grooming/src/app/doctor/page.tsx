'use client'
import { useRouter } from 'next/navigation'
import type { QueueItem } from '@/types'
import { useQueueStore } from '@/stores/queueStore'

const STATUS_LABEL: Record<string, string> = {
  waiting: '開始看診',
  'in-progress': '進行中',
  done: '已完成',
}

export default function DoctorPage() {
  const router = useRouter()
  const queue = useQueueStore((s) => s.queue)
  const startConsult = useQueueStore((s) => s.startConsult)

  function handleStart(item: QueueItem) {
    startConsult(item)
    router.push('/doctor/consult')
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold mb-6">看診隊列</h1>
      <div className="max-w-2xl space-y-3">
        {queue.map((item) => (
          <div key={item.queueNum}
            className="bg-card rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="font-bold text-lg">
                <span className="text-primary mr-2">{item.queueNum}</span>
                {item.petName}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.memberName} · {item.petBreed} · {item.weight} kg
              </p>
              {item.allergies.length > 0 && (
                <p className="text-xs text-destructive mt-0.5">
                  ⚠ 過敏：{item.allergies.join('、')}
                </p>
              )}
            </div>
            <button
              disabled={item.status !== 'waiting'}
              onClick={() => handleStart(item)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {STATUS_LABEL[item.status] ?? item.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
