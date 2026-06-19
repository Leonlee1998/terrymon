'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Groomer, ShiftRow } from './MonthlySchedule'

const DOW = ['一', '二', '三', '四', '五', '六', '日']

const PRESETS = [
  { key: 'full', label: '全天', start: '09:00', end: '18:00', off: false },
  { key: 'am',   label: '早班', start: '09:00', end: '13:00', off: false },
  { key: 'pm',   label: '午班', start: '14:00', end: '18:00', off: false },
  { key: 'off',  label: '休',   start: '09:00', end: '18:00', off: true  },
] as const
type PresetKey = typeof PRESETS[number]['key']

function getWeekMonday(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow))
  return d
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function existingPreset(shifts: ShiftRow[], gid: string, dateStr: string): PresetKey {
  const s = shifts.find(x => x.groomer_id === gid && x.work_date === dateStr)
  if (!s || s.is_day_off) return 'off'
  const st = s.start_time?.slice(0,5), et = s.end_time?.slice(0,5)
  if (st === '09:00' && et === '18:00') return 'full'
  if (st === '09:00' && et === '13:00') return 'am'
  if (st === '14:00' && et === '18:00') return 'pm'
  return 'off'
}

interface Props {
  groomers: Groomer[]; year: number; month: number
  existingShifts: ShiftRow[]
  onClose: () => void
  onShiftsSaved: (shifts: ShiftRow[]) => void
}

export default function QuickFillPanel({ groomers, year, month, existingShifts, onClose, onShiftsSaved }: Props) {
  const active = groomers.filter(g => g.is_active)
  const minMonday = getWeekMonday(new Date(year, month - 1, 1))
  const maxMonday = getWeekMonday(new Date(year, month, 0))

  const [weekMonday, setWeekMonday] = useState<Date>(minMonday)
  const [local, setLocal]           = useState<Record<string, Record<string, PresetKey>>>({})
  const [saving, setSaving]         = useState(false)

  const weekDates = getWeekDates(weekMonday)
  const canPrev   = weekMonday > minMonday
  const canNext   = weekMonday < maxMonday

  function prevWeek() { const d = new Date(weekMonday); d.setDate(d.getDate()-7); setWeekMonday(d) }
  function nextWeek() { const d = new Date(weekMonday); d.setDate(d.getDate()+7); setWeekMonday(d) }

  function setDay(gid: string, dateStr: string, key: PresetKey) {
    setLocal(p => ({ ...p, [gid]: { ...p[gid], [dateStr]: key } }))
  }

  function getKey(gid: string, dateStr: string): PresetKey {
    return local[gid]?.[dateStr] ?? existingPreset(existingShifts, gid, dateStr)
  }

  function isThisMonth(d: Date) {
    return d.getFullYear() === year && d.getMonth() + 1 === month
  }

  const weekLabel = (() => {
    const a = weekDates[0], b = weekDates[6]
    return `${a.getMonth()+1}/${a.getDate()} – ${b.getMonth()+1}/${b.getDate()}`
  })()

  const weekNo = Math.round((weekMonday.getTime() - minMonday.getTime()) / 604800000) + 1
  const hasLocal = Object.values(local).some(g => Object.keys(g).length > 0)

  async function handleSave() {
    const changes: Array<{ gid: string; dateStr: string; preset: typeof PRESETS[number] }> = []
    for (const [gid, days] of Object.entries(local)) {
      for (const [dateStr, key] of Object.entries(days)) {
        const preset = PRESETS.find(p => p.key === key)!
        changes.push({ gid, dateStr, preset })
      }
    }
    if (!changes.length) return

    setSaving(true)
    try {
      const saved: ShiftRow[] = []
      await Promise.all(changes.map(async ({ gid, dateStr, preset }) => {
        const res = await fetch('/api/admin/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groomerId: gid, workDate: dateStr, startTime: preset.start, endTime: preset.end, isDayOff: preset.off }),
        })
        if (!res.ok) throw new Error()
        saved.push({ id: Date.now() + gid, groomer_id: gid, work_date: dateStr, start_time: preset.start, end_time: preset.end, is_day_off: preset.off, note: null })
      }))
      toast.success(`已儲存 ${saved.length} 筆班次`)
      onShiftsSaved(saved)
      setLocal({})
    } catch {
      toast.error('儲存失敗，請重試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-t shrink-0">
          <div>
            <p className="font-bold text-ink">快速排班</p>
            <p className="text-xs text-slate-t">{year} 年 {month} 月</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface text-slate-t"><X size={18} /></button>
        </div>

        {/* Week nav */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-t bg-surface/50 shrink-0">
          <button onClick={prevWeek} disabled={!canPrev}
            className="p-1.5 rounded-lg border border-border-t hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-ink text-sm">{weekLabel}</p>
            <p className="text-xs text-slate-t">第 {weekNo} 週</p>
          </div>
          <button onClick={nextWeek} disabled={!canNext}
            className="p-1.5 rounded-lg border border-border-t hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Date headers */}
          <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-1 mb-3">
            <span />
            {weekDates.map((d, i) => {
              const inMonth  = isThisMonth(d)
              const isWkend  = i >= 5
              return (
                <div key={i} className={cn('text-center', !inMonth && 'opacity-30')}>
                  <p className={cn('text-[11px] font-bold', isWkend ? 'text-rose-400' : 'text-ink')}>{DOW[i]}</p>
                  <p className={cn('text-[10px]', isWkend ? 'text-rose-300' : 'text-slate-t')}>{d.getMonth()+1}/{d.getDate()}</p>
                </div>
              )
            })}
          </div>

          {/* Groomer rows */}
          <div className="space-y-3">
            {active.map(g => (
              <div key={g.id} className="grid grid-cols-[72px_repeat(7,1fr)] gap-1 items-start">
                <p className="text-sm font-medium text-ink pt-1 truncate">{g.name}</p>
                {weekDates.map((d, di) => {
                  const dateStr  = toDateStr(d)
                  const inMonth  = isThisMonth(d)
                  const current  = getKey(g.id, dateStr)
                  const modified = !!local[g.id]?.[dateStr]
                  return (
                    <div key={di} className={cn('flex flex-col gap-0.5', !inMonth && 'opacity-25 pointer-events-none')}>
                      {PRESETS.map(opt => {
                        const sel = current === opt.key
                        return (
                          <button key={opt.key}
                            onClick={() => setDay(g.id, dateStr, opt.key)}
                            className={cn(
                              'w-full text-[10px] rounded py-0.5 font-medium border transition-colors',
                              sel ? (
                                opt.key === 'off'  ? 'bg-gray-200 text-gray-600 border-gray-300' :
                                opt.key === 'full' ? 'bg-primary text-white border-primary' :
                                opt.key === 'am'   ? 'bg-sky-500 text-white border-sky-500' :
                                                     'bg-amber-500 text-white border-amber-500'
                              ) : 'bg-white text-slate-t border-border-t hover:border-primary/40'
                            )}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                      {modified && <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-0.5" />}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-t shrink-0">
          <button onClick={handleSave} disabled={saving || !hasLocal}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 size={14} className="animate-spin" />儲存中…</>
              : hasLocal ? '儲存本週排班' : '尚無變更'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
