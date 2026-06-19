'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Scissors, Stethoscope, Cake, NotebookPen } from 'lucide-react'
import { useCalendarEvents, type CalEvent } from '@/hooks/useCalendarEvents'
import { useAuthStore } from '@/stores/authStore'
import { getSupabase } from '@/lib/supabase'
import type { Appointment, Pet } from '@/types'
import AppointmentCard from './AppointmentCard'
import AppointmentFAB from './AppointmentFAB'

const TYPE_DOT: Record<string, string> = {
  appointment: 'bg-blue-400',
  grooming:    'bg-accent',
  medical:     'bg-primary',
  birthday:    'bg-pink-400',
  custom:      'bg-violet-400',
}
const TYPE_ICON: Record<string, React.ElementType> = {
  appointment: CalendarDays,
  grooming:    Scissors,
  medical:     Stethoscope,
  birthday:    Cake,
  custom:      NotebookPen,
}
const TYPE_COLOR: Record<string, string> = {
  appointment: 'text-blue-500 bg-blue-50',
  grooming:    'text-accent bg-accent-light',
  medical:     'text-primary bg-primary-bg',
  birthday:    'text-pink-500 bg-pink-50',
  custom:      'text-violet-500 bg-violet-50',
}
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:    { label: '待確認', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  confirmed:  { label: '已確認', cls: 'bg-green-50 text-green-600 border-green-200' },
  cancelled:  { label: '已取消', cls: 'bg-red-50 text-red-500 border-red-200' },
  completed:  { label: '已完成', cls: 'bg-surface text-slate-t border-border-t' },
  checked_in: { label: '已報到', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  in_service: { label: '服務中', cls: 'bg-primary-bg text-primary border-primary/20' },
}
const DAYS = ['日', '一', '二', '三', '四', '五', '六']
const toYMD = (d: Date) => d.toISOString().slice(0, 10)
const dayKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

interface Props { initialAppointments: Appointment[]; pets: Pet[] }

export default function AppointmentsClient({ initialAppointments, pets }: Props) {
  const today = new Date()
  const [current, setCurrent]     = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected]   = useState(toYMD(today))
  const [appointments, setAppointments] = useState(initialAppointments)
  const { events, loading, load, refetch } = useCalendarEvents()
  const { member } = useAuthStore()

  useEffect(() => { load() }, [load])

  // Realtime 同步預約狀態變更
  useEffect(() => {
    if (!member) return
    const sb = getSupabase()
    if (!sb) return
    const ch = sb.channel('appts-page').on('postgres_changes', {
      event: '*', schema: 'public', table: 'appointments',
      filter: `member_id=eq.${member.id}`,
    }, () => refetch()).subscribe()
    return () => { sb.removeChannel(ch) }
  }, [member, refetch])

  const year = current.getFullYear()
  const month = current.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = new Date(year, month, 1).getDay()
  const cells = [...Array(offset).fill(0), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const eventMap = new Map<string, CalEvent[]>()
  for (const e of events) { eventMap.set(e.date, [...(eventMap.get(e.date) ?? []), e]) }
  const selectedEvents = eventMap.get(selected) ?? []

  function goToday() {
    setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(toYMD(today))
  }

  function handleCancel(id: string) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as Appointment['status'] } : a))
    void refetch()
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col min-h-screen">

      {/* ── 月曆區塊 ─────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-[#eadfd2] sticky top-14 z-20">

        {/* 月份導航 */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-bold text-lg text-ink">預約管理</h1>
          <button onClick={goToday} className="text-xs text-primary font-semibold px-3 py-1 rounded-full bg-primary-bg">
            今天
          </button>
        </div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 rounded-xl hover:bg-surface">
            <ChevronLeft size={18} className="text-ink" />
          </button>
          <span className="text-sm font-bold text-ink">{year} 年 {month + 1} 月</span>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 rounded-xl hover:bg-surface">
            <ChevronRight size={18} className="text-ink" />
          </button>
        </div>

        {/* 星期標頭 */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-medium text-slate-t py-0.5">{d}</div>
          ))}
        </div>

        {/* 日期格子 */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />
            const key = dayKey(year, month, d)
            const dots = eventMap.get(key) ?? []
            const isToday = key === toYMD(today)
            const isSel   = key === selected
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                  isSel   ? 'bg-primary' :
                  isToday ? 'bg-primary-bg' :
                            'hover:bg-surface'
                }`}
              >
                <span className={`text-sm font-medium leading-none ${
                  isSel   ? 'text-white' :
                  isToday ? 'text-primary font-bold' :
                            'text-ink'
                }`}>{d}</span>
                <div className="flex gap-0.5 mt-1 h-1.5">
                  {dots.slice(0, 3).map((e, ei) => (
                    <div key={ei} className={`size-1 rounded-full ${isSel ? 'bg-white/70' : TYPE_DOT[e.type]}`} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 選定日期的事件列表 ────────────────────── */}
      <div className="flex-1 px-4 pt-4 pb-28">
        <p className="text-xs font-semibold text-slate-t mb-3">
          {selected.replace(/-/g, '/')}
          {selectedEvents.length > 0 ? ` · ${selectedEvents.length} 個事件` : ''}
        </p>

        {loading && <p className="text-sm text-slate-t text-center py-10">載入中…</p>}

        {!loading && selectedEvents.length === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm text-slate-t">這天沒有預約或事件</p>
            <p className="text-xs text-slate-t mt-1">點右下角 <span className="font-bold">+</span> 新增</p>
          </div>
        )}

        <div className="space-y-3">
          {selectedEvents.map(event => {
            // 預約類型 → 用完整的 AppointmentCard
            if (event.type === 'appointment') {
              const appt = appointments.find(a => a.id === event.id)
              if (appt) {
                const pet = pets.find(p => p.id === appt.petId)
                return (
                  <AppointmentCard
                    key={event.id}
                    appointment={appt}
                    pet={pet}
                    onCancel={handleCancel}
                  />
                )
              }
            }

            // 其他事件類型（美容紀錄、醫療、生日、自訂）
            const Icon = TYPE_ICON[event.type] ?? CalendarDays
            const colorCls = TYPE_COLOR[event.type] ?? 'text-slate-t bg-surface'
            const statusMeta = event.status ? STATUS_LABEL[event.status] : null

            return (
              <div key={event.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-[#eadfd2]">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{event.title}</p>
                    {event.time && <p className="text-xs text-slate-t flex-shrink-0">{event.time}</p>}
                  </div>
                  {event.petName && <p className="text-xs text-slate-t mt-0.5">{event.petName}</p>}
                  {event.detail  && <p className="text-xs text-slate-t">{event.detail}</p>}
                  {statusMeta && (
                    <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusMeta.cls}`}>
                      {statusMeta.label}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AppointmentFAB defaultDate={selected} onEventCreated={refetch} />
    </div>
  )
}
