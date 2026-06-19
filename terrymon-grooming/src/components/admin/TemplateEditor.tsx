'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Groomer } from './MonthlySchedule'

type DayTpl = { startTime: string; endTime: string; isDayOff: boolean }
type WeekTpl = Record<number, DayTpl> // 0=Sun...6=Sat

const DEFAULT_DAY: DayTpl = { startTime: '09:00', endTime: '18:00', isDayOff: false }
const OFF_DAY: DayTpl     = { startTime: '09:00', endTime: '18:00', isDayOff: true }

const QUICK = [
  { label: '全天',  value: { startTime: '09:00', endTime: '18:00', isDayOff: false } },
  { label: '上午',  value: { startTime: '09:00', endTime: '13:00', isDayOff: false } },
  { label: '下午',  value: { startTime: '14:00', endTime: '18:00', isDayOff: false } },
  { label: '休假',  value: OFF_DAY },
]

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']

function initTemplate(): WeekTpl {
  return {
    0: OFF_DAY,
    1: { ...DEFAULT_DAY },
    2: { ...DEFAULT_DAY },
    3: { ...DEFAULT_DAY },
    4: { ...DEFAULT_DAY },
    5: { ...DEFAULT_DAY },
    6: { startTime: '09:00', endTime: '13:00', isDayOff: false },
  }
}

interface Props {
  groomers: Groomer[]
  year: number
  month: number
  onGenerated: () => void
}

export default function TemplateEditor({ groomers, year, month, onGenerated }: Props) {
  const activeGroomers = groomers.filter(g => g.is_active)
  const [templates, setTemplates] = useState<Record<string, WeekTpl>>(
    () => Object.fromEntries(activeGroomers.map(g => [g.id, initTemplate()]))
  )
  const [generating, setGenerating] = useState(false)

  function setDay(groomerId: string, dow: number, tpl: DayTpl) {
    setTemplates(prev => ({
      ...prev,
      [groomerId]: { ...prev[groomerId], [dow]: tpl },
    }))
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/shifts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, templates }),
      })
      const data = await res.json() as { inserted?: number; error?: string }
      if (!res.ok) throw new Error(data.error)
      toast.success(`已產生 ${data.inserted} 筆班次（已有資料不覆蓋）`)
      onGenerated()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '產生失敗')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-primary-bg rounded-xl px-4 py-3 text-sm text-primary">
        設定每位美容師的週預設班型，點「產生班表」將套用到 <strong>{year} 年 {month} 月</strong>。<br />
        <span className="text-xs opacity-80">已手動排過的日期不會被覆蓋。產生後可在「月班表」逐日調整。</span>
      </div>

      {activeGroomers.map(g => (
        <div key={g.id} className="bg-white rounded-2xl border border-border-t overflow-hidden">
          <div className="px-5 py-3 border-b border-border-t bg-surface">
            <p className="font-bold text-ink">{g.name}</p>
          </div>
          <div className="grid grid-cols-7 divide-x divide-border-t">
            {[1, 2, 3, 4, 5, 6, 0].map(dow => {
              const tpl = templates[g.id]?.[dow] ?? DEFAULT_DAY
              const isOff = tpl.isDayOff
              const isWeekend = dow === 0 || dow === 6
              return (
                <div key={dow} className={cn('p-2.5 flex flex-col gap-1.5', isWeekend && 'bg-rose-50/30')}>
                  <p className={cn('text-xs font-semibold text-center', isWeekend ? 'text-rose-400' : 'text-slate-t')}>
                    {DAY_NAMES[dow]}
                  </p>
                  {QUICK.map(q => (
                    <button
                      key={q.label}
                      onClick={() => setDay(g.id, dow, q.value)}
                      className={cn(
                        'text-[11px] rounded-lg py-1 w-full font-medium transition-colors',
                        JSON.stringify(tpl) === JSON.stringify(q.value)
                          ? q.value.isDayOff ? 'bg-gray-200 text-gray-600' : 'bg-primary text-white'
                          : 'bg-surface text-slate-t hover:bg-border-t'
                      )}
                    >
                      {q.label}
                    </button>
                  ))}
                  {!isOff && (
                    <div className="flex gap-0.5 mt-0.5">
                      <input
                        type="time"
                        value={tpl.startTime}
                        onChange={e => setDay(g.id, dow, { ...tpl, startTime: e.target.value })}
                        className="w-full text-[10px] border border-border-t rounded px-1 py-0.5"
                      />
                    </div>
                  )}
                  {!isOff && (
                    <input
                      type="time"
                      value={tpl.endTime}
                      onChange={e => setDay(g.id, dow, { ...tpl, endTime: e.target.value })}
                      className="w-full text-[10px] border border-border-t rounded px-1 py-0.5"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="bg-primary text-white w-full sm:w-auto"
      >
        {generating ? '產生中…' : `產生 ${year} 年 ${month} 月班表`}
      </Button>
    </div>
  )
}
