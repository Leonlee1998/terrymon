'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Scissors, Stethoscope, Cake, Plus, NotebookPen } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCalendarEvents, type CalEvent } from '@/hooks/useCalendarEvents'
import { useAuthStore } from '@/stores/authStore'
import { getSupabase } from '@/lib/supabase'
import AddEventDialog from './AddEventDialog'

const TYPE_CONFIG = {
  appointment: { Icon: CalendarDays, color: 'text-blue-500',   bg: 'bg-blue-50',    dot: 'bg-blue-400' },
  grooming:    { Icon: Scissors,    color: 'text-accent',      bg: 'bg-accent-light',dot: 'bg-accent'   },
  medical:     { Icon: Stethoscope, color: 'text-primary',     bg: 'bg-primary-bg', dot: 'bg-primary'  },
  birthday:    { Icon: Cake,        color: 'text-pink-500',    bg: 'bg-pink-50',    dot: 'bg-pink-400' },
  custom:      { Icon: NotebookPen, color: 'text-violet-500',  bg: 'bg-violet-50',  dot: 'bg-violet-400' },
}
const SOURCE_LABEL = { vet: '獸醫院', grooming: '美容院', personal: '個人' }
const DAYS = ['日', '一', '二', '三', '四', '五', '六']
const toYMD = (d: Date) => d.toISOString().slice(0, 10)
const dayKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

interface Props { open: boolean; onOpenChange: (v: boolean) => void }

export default function CalendarSheet({ open, onOpenChange }: Props) {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(toYMD(today))
  const [petFilter, setPetFilter] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const { events, loading, load, refetch } = useCalendarEvents()
  const { member } = useAuthStore()

  useEffect(() => { if (open) load() }, [open, load])

  useEffect(() => {
    if (!open || !member) return
    const sb = getSupabase()
    if (!sb) return
    const ch = sb.channel('cal-appts').on('postgres_changes', {
      event: '*', schema: 'public', table: 'appointments',
      filter: `member_id=eq.${member.id}`,
    }, () => refetch()).subscribe()
    return () => { sb.removeChannel(ch) }
  }, [open, member, refetch])

  const year = current.getFullYear()
  const month = current.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = new Date(year, month, 1).getDay()
  const cells = [...Array(offset).fill(0), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const filtered = petFilter ? events.filter(e => e.petId === petFilter) : events
  const eventMap = new Map<string, CalEvent[]>()
  for (const e of filtered) { eventMap.set(e.date, [...(eventMap.get(e.date) ?? []), e]) }
  const selectedEvents = eventMap.get(selected) ?? []

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle>行事曆</SheetTitle>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white">
              <Plus size={13} /> 新增事件
            </button>
          </SheetHeader>

          {member && member.pets.length > 1 && (
            <div className="mt-3 flex gap-1.5 flex-wrap">
              <button onClick={() => setPetFilter(null)} className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${!petFilter ? 'bg-primary text-white' : 'bg-surface text-slate-t'}`}>全部</button>
              {member.pets.map(p => (
                <button key={p.id} onClick={() => setPetFilter(petFilter === p.id ? null : p.id)} className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${petFilter === p.id ? 'bg-primary text-white' : 'bg-surface text-slate-t'}`}>{p.name}</button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 mb-3">
            <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-surface"><ChevronLeft size={18} /></button>
            <span className="font-bold text-ink">{year} 年 {month + 1} 月</span>
            <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-surface"><ChevronRight size={18} /></button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => <div key={d} className="text-center text-[11px] font-medium text-slate-t py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />
              const key = dayKey(year, month, d)
              const dots = eventMap.get(key) ?? []
              const isToday = key === toYMD(today)
              const isSel = key === selected
              return (
                <button key={key} onClick={() => setSelected(key)} className={`flex flex-col items-center py-1.5 rounded-lg transition-colors ${isSel ? 'bg-primary' : isToday ? 'bg-primary-bg' : 'hover:bg-surface'}`}>
                  <span className={`text-sm font-medium leading-none ${isSel ? 'text-white' : isToday ? 'text-primary' : 'text-ink'}`}>{d}</span>
                  <div className="flex gap-0.5 mt-1 h-1.5">
                    {dots.slice(0, 3).map((e, ei) => <div key={ei} className={`size-1 rounded-full ${isSel ? 'bg-white/70' : TYPE_CONFIG[e.type].dot}`} />)}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="border-t border-border-t mt-4 pt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-t mb-3">{selected.replace(/-/g, '/')} · {selectedEvents.length} 個事件</p>
            {loading && <p className="text-sm text-slate-t text-center py-6">載入中…</p>}
            {!loading && selectedEvents.length === 0 && <p className="text-sm text-slate-t text-center py-6">這天沒有事件</p>}
            {selectedEvents.map(event => {
              const { Icon, color, bg } = TYPE_CONFIG[event.type]
              return (
                <div key={event.id} className={`flex items-start gap-3 rounded-xl p-3 ${bg}`}>
                  <Icon size={15} className={`mt-0.5 shrink-0 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-bold text-ink">{event.title}</p>
                      <span className="shrink-0 rounded-full bg-black/5 px-1.5 py-0.5 text-[9px] text-slate-t">{SOURCE_LABEL[event.source]}</span>
                    </div>
                    <p className="text-xs text-slate-t mt-0.5">{event.petName}{event.detail ? ` · ${event.detail}` : ''}</p>
                    {event.time && <p className="text-[10px] text-slate-t mt-0.5">⏰ {event.time}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
      <AddEventDialog open={addOpen} defaultDate={selected} onOpenChange={setAddOpen} onCreated={refetch} />
    </>
  )
}
