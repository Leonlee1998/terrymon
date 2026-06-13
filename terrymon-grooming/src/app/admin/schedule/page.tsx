'use client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { MOCK_TODAY_SCHEDULE } from '@/lib/mock'
import { cn } from '@/lib/utils'

const STATUS_MAP = {
  completed: { label: '已完成', cls: 'bg-green-100 text-green-700' },
  'in-progress': { label: '進行中', cls: 'bg-blue-100 text-blue-700 animate-pulse' },
  pending: { label: '待服務', cls: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: '已取消', cls: 'bg-gray-100 text-gray-500' },
}

export default function SchedulePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">排班預約</h1>
        <Button
          onClick={() => toast('新增預約功能開發中')}
          className="bg-primary hover:bg-primary-hover text-white"
        >
          <Plus size={16} className="mr-1" />新增預約
        </Button>
      </div>

      <div className="space-y-3">
        {MOCK_TODAY_SCHEDULE.map(item => {
          const { label, cls } = STATUS_MAP[item.status]
          return (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="w-14 shrink-0 text-sm font-mono text-slate-t pt-4">{item.time}</div>
              <div className="flex-1 bg-surface border border-border-t rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-ink">{item.petName}</span>
                    <span className="text-slate-t text-sm ml-2">｜{item.memberName}</span>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', cls)}>
                    {label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-t">{item.service} · 美容師：{item.groomer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
