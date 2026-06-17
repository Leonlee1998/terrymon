'use client'

import { useState, useEffect } from 'react'
import { UtensilsCrossed, Droplets, Wind, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/services/api'
import type { PetDailyLog, DietLogData, PoopLogData, VomitLogData } from '@/types'

const POOP_LABEL: Record<string, string> = {
  normal: '正常', soft: '偏軟', loose: '拉稀', constipated: '便秘',
}

function shiftDate(date: string, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function DailySummaryCard({ petId }: { petId: string }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [logs, setLogs] = useState<PetDailyLog[]>([])

  useEffect(() => {
    api.getDailyLogs(petId, date).then(setLogs)
  }, [petId, date])

  const dietLogs  = logs.filter(l => l.type === 'diet').map(l => ({ ...l, data: l.data as DietLogData }))
  const poopLogs  = logs.filter(l => l.type === 'poop').map(l => ({ ...l, data: l.data as PoopLogData }))
  const vomitLogs = logs.filter(l => l.type === 'vomit').map(l => ({ ...l, data: l.data as VomitLogData }))
  const hasBlood  = vomitLogs.some(l => l.data.content === 'blood')

  const [, mm, dd] = date.split('-')
  const dateLabel = date === today ? '今天' : date === shiftDate(today, -1) ? '昨天' : `${mm}/${dd}`

  return (
    <section className="rounded-xl border border-border-t bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">日常紀錄</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setDate(d => shiftDate(d, -1))}
            className="rounded-lg p-1 text-slate-t hover:text-ink active:scale-90">
            <ChevronLeft size={16} />
          </button>
          <label className="relative cursor-pointer">
            <span className="rounded-lg bg-primary-bg px-3 py-1 text-sm font-semibold text-primary">
              {dateLabel}
            </span>
            <input type="date" value={date} max={today}
              onChange={e => e.target.value && setDate(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0" />
          </label>
          <button onClick={() => setDate(d => shiftDate(d, 1))}
            disabled={date >= today}
            className="rounded-lg p-1 text-slate-t hover:text-ink active:scale-90 disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="py-2 text-center text-sm text-slate-t">這天尚無紀錄</p>
      ) : (
        <div className="space-y-3">
          {dietLogs.length > 0 && (
            <div className="flex items-start gap-3">
              <UtensilsCrossed size={15} className="mt-0.5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-t">飲食 · {dietLogs.length} 筆</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {dietLogs.map(l => (
                    <span key={l.id} className="rounded-full bg-primary-bg px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {l.data.mealTimeLabel} · {l.data.foodName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {poopLogs.length > 0 && (
            <div className="flex items-start gap-3">
              <Droplets size={15} className="mt-0.5 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-t">糞便 · {poopLogs.length} 次</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {poopLogs.map((l, i) => (
                    <span key={l.id} className="text-xs text-ink">
                      第{i + 1}次 {POOP_LABEL[l.data.consistency]}
                    </span>
                  ))}
                </div>
              </div>
              {poopLogs[0].photoUrls?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poopLogs[0].photoUrls[0]} alt="糞便照片"
                  className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border-t" />
              )}
            </div>
          )}

          {vomitLogs.length > 0 && (
            <div className="flex items-start gap-3">
              <Wind size={15} className={`mt-0.5 shrink-0 ${hasBlood ? 'text-error' : 'text-orange-500'}`} />
              <div className="flex-1">
                <p className={`text-xs font-semibold ${hasBlood ? 'text-error' : 'text-slate-t'}`}>
                  嘔吐 · {vomitLogs.length} 次{hasBlood ? ' · 含血，建議就診' : ''}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {vomitLogs.map((l, i) => (
                    <span key={l.id} className="text-xs text-ink">第{i + 1}次 {l.data.contentLabel}</span>
                  ))}
                </div>
              </div>
              {vomitLogs[0].photoUrls?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vomitLogs[0].photoUrls[0]} alt="嘔吐照片"
                  className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border-t" />
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
