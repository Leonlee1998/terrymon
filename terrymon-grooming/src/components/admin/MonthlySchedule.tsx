'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getHoliday } from '@/lib/holidays'
import DayEditDialog from './DayEditDialog'
import QuickFillPanel from './QuickFillPanel'
import ClosurePanel from './ClosurePanel'

export type ShiftRow = {
  id: string; groomer_id: string; work_date: string
  start_time: string | null; end_time: string | null
  is_day_off: boolean; note: string | null
}
export type Groomer = {
  id: string; name: string; is_active: boolean
  employment_type?: 'full_time' | 'part_time'
}
export type Closure = { id: string; date: string; reason: string | null }

const DOW = ['日', '一', '二', '三', '四', '五', '六']
const TODAY = new Date().toISOString().slice(0, 10)

function classifyShift(s: ShiftRow | undefined): string | null {
  if (!s || s.is_day_off) return null
  const st = s.start_time?.slice(0, 5)
  const et = s.end_time?.slice(0, 5)
  if (st === '09:00' && et === '18:00') return '全天'
  if (st === '09:00' && et === '13:00') return '早班'
  if (st === '14:00' && et === '18:00') return '午班'
  return `${st}–${et}`
}

const SHIFT_COLORS: Record<string, string> = {
  '全天': 'bg-primary text-white',
  '早班': 'bg-sky-500 text-white',
  '午班': 'bg-amber-500 text-white',
}

interface Props {
  groomers: Groomer[]; year: number; month: number
  onPrev: () => void; onNext: () => void
  onMonthChange: (y: number, m: number) => void
}

export default function MonthlySchedule({ groomers, year, month, onPrev, onNext, onMonthChange }: Props) {
  const [shifts,   setShifts]   = useState<ShiftRow[]>([])
  const [closures, setClosures] = useState<Closure[]>([])
  const [loading,  setLoading]  = useState(false)
  const [editDay,  setEditDay]  = useState<string | null>(null)
  const [showFill, setShowFill] = useState(false)

  const activeGroomers = groomers.filter(g => g.is_active)

  function handleClosureChanged(date: string, closure: Closure | null) {
    setClosures(prev =>
      closure ? [...prev.filter(c => c.date !== date), closure] : prev.filter(c => c.date !== date)
    )
  }

  function handleShiftsSaved(saved: ShiftRow[]) {
    setShifts(prev => {
      const next = prev.filter(s =>
        !saved.some(u => u.groomer_id === s.groomer_id && u.work_date === s.work_date)
      )
      return [...next, ...saved]
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(`/api/admin/shifts?year=${year}&month=${month}`),
        fetch(`/api/admin/closures?year=${year}&month=${month}`),
      ])
      const [sData, cData] = await Promise.all([sRes.json(), cRes.json()])
      setShifts(Array.isArray(sData) ? sData : [])
      setClosures(Array.isArray(cData) ? cData : [])
    } catch {
      toast.error('班表載入失敗')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { void load() }, [load])

  const firstDow = new Date(year, month - 1, 1).getDay()
  const lastDay  = new Date(year, month, 0).getDate()
  const cells    = [...Array(firstDow).fill(null), ...Array.from({ length: lastDay }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  function pad(n: number) { return String(n).padStart(2, '0') }
  function dateStr(d: number) { return `${year}-${pad(month)}-${pad(d)}` }

  return (
    <>
      {/* Nav bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-surface border border-border-t"><ChevronLeft size={16} /></button>
        <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-surface border border-border-t"><ChevronRight size={16} /></button>
        <span className="font-bold text-ink text-lg mx-1">{year} 年 {month} 月</span>
        {loading && <Loader2 size={15} className="animate-spin text-slate-t" />}
        <div className="ml-auto flex items-center gap-2">
          <select value={month} onChange={e => onMonthChange(year, Number(e.target.value))}
            className="border border-border-t rounded-lg px-2 py-1 text-sm">
            {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{i+1} 月</option>)}
          </select>
          <select value={year} onChange={e => onMonthChange(Number(e.target.value), month)}
            className="border border-border-t rounded-lg px-2 py-1 text-sm">
            {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowFill(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90">
            <CalendarDays size={14} /> 週排班
          </button>
        </div>
      </div>

      {/* ── Closure panel – always visible above calendar ── */}
      <ClosurePanel
        year={year} month={month}
        closures={closures}
        onClosureChanged={handleClosureChanged}
      />

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-border-t overflow-hidden mt-4">
        <div className="grid grid-cols-7 border-b border-border-t">
          {DOW.map((d, i) => (
            <div key={d} className={cn('py-2 text-center text-xs font-semibold', i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-t')}>{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border-t border-b border-border-t last:border-b-0">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="bg-surface/40 min-h-[90px]" />
              const date     = dateStr(day)
              const closure  = closures.find(c => c.date === date)
              const holiday  = getHoliday(date)
              const isToday  = date === TODAY
              const isWkend  = di === 0 || di === 6

              if (closure) return (
                <button key={di} onClick={() => setEditDay(date)}
                  className="min-h-[90px] p-1.5 flex flex-col bg-rose-50 hover:bg-rose-100 transition-colors w-full text-left">
                  <span className={cn('text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-0.5',
                    isToday ? 'bg-primary text-white' : 'text-rose-500')}>{day}</span>
                  {holiday && <span className="text-[9px] text-orange-500 font-medium">{holiday}</span>}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-rose-500">店休</span>
                    {closure.reason && <span className="text-[10px] text-rose-400 text-center leading-tight">{closure.reason}</span>}
                  </div>
                </button>
              )

              return (
                <button key={di} onClick={() => setEditDay(date)}
                  className={cn('min-h-[90px] p-1.5 text-left flex flex-col gap-0.5 hover:bg-primary/5 transition-colors w-full',
                    isWkend && 'bg-rose-50/30')}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={cn('text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0',
                      isToday ? 'bg-primary text-white' : isWkend ? 'text-rose-400' : 'text-ink')}>{day}</span>
                    {holiday && <span className="text-[9px] text-orange-500 font-medium truncate">{holiday}</span>}
                  </div>
                  {activeGroomers.map(g => {
                    const shift = shifts.find(s => s.groomer_id === g.id && s.work_date === date)
                    const label = classifyShift(shift)
                    if (!label) return null
                    return (
                      <div key={g.id} className={cn('text-[10px] rounded px-1 py-0.5 font-medium truncate',
                        SHIFT_COLORS[label] ?? 'bg-purple-500 text-white')}>
                        {g.name.slice(0, 2)} {label}
                      </div>
                    )
                  })}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-2 mt-3 flex-wrap text-xs items-center">
        {Object.entries(SHIFT_COLORS).map(([label, cls]) => (
          <span key={label} className={cn('px-2 py-0.5 rounded-full font-medium', cls)}>{label}</span>
        ))}
        <span className="px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-500">店休</span>
        <span className="text-slate-t ml-1">· 點日期格可調整排班或店休</span>
      </div>

      {editDay !== null && (
        <DayEditDialog
          date={editDay}
          groomers={groomers}
          shifts={shifts}
          closures={closures}
          onClose={() => setEditDay(null)}
          onShiftSaved={updated => setShifts(prev => [
            ...prev.filter(s => !(s.groomer_id === updated.groomer_id && s.work_date === updated.work_date)),
            updated,
          ])}
          onClosureChanged={handleClosureChanged}
        />
      )}

      {showFill && (
        <QuickFillPanel
          groomers={groomers}
          year={year}
          month={month}
          existingShifts={shifts}
          onClose={() => setShowFill(false)}
          onShiftsSaved={handleShiftsSaved}
        />
      )}
    </>
  )
}
