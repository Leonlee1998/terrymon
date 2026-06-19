'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, CheckCircle, XCircle, Plus, User } from 'lucide-react'
import { toast } from 'sonner'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import CreateApptDialog from '@/components/admin/CreateApptDialog'
import { cn } from '@/lib/utils'

type Groomer = { id: string; name: string }

type Appt = {
  id: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  estimated_price: number | null
  notes: string | null
  photo_url: string | null
  cancel_reason: string | null
  members: { name: string; phone: string } | null
  pets: { name: string; breed: string; weight: number; allergies: string[]; species: string } | null
  groomers: { name: string } | null
  grooming_services: { name: string } | null
}

const STATUS: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:     { label: '待確認', bg: 'bg-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-400' },
  confirmed:   { label: '已確認', bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  checked_in:  { label: '已報到', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  in_service:  { label: '進行中', bg: 'bg-primary/10',  text: 'text-primary',     dot: 'bg-primary' },
  completed:   { label: '已完成', bg: 'bg-gray-100',    text: 'text-gray-400',    dot: 'bg-gray-300' },
}

const DOW = ['日', '一', '二', '三', '四', '五', '六']
const TODAY = new Date().toISOString().slice(0, 10)

export default function AppointmentsPage() {
  const now = new Date()
  const [year,   setYear]   = useState(now.getFullYear())
  const [month,  setMonth]  = useState(now.getMonth() + 1)
  const [selDate, setSelDate] = useState(TODAY)
  const [appts,  setAppts]  = useState<Appt[]>([])
  const [groomers, setGroomers] = useState<Groomer[]>([])
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/appointments?year=${year}&month=${month}`)
      const data = await res.json() as Appt[]
      setAppts(Array.isArray(data) ? data : [])
    } catch {
      toast.error('載入失敗')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    fetch('/api/admin/groomers')
      .then(r => r.json())
      .then((d: Groomer[]) => setGroomers(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1)
  }

  async function handleAction(id: string, action: 'confirm' | 'reject', groomerId?: string) {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, groomerId }),
      })
      if (!res.ok) throw new Error()
      toast.success(action === 'confirm' ? '已確認預約' : '已拒絕預約')
      void load()
    } catch {
      toast.error('操作失敗')
    } finally {
      setActing(null)
    }
  }

  // Calendar grid
  const pad = (n: number) => String(n).padStart(2, '0')
  const toDate = (d: number) => `${year}-${pad(month)}-${pad(d)}`
  const firstDow = new Date(year, month - 1, 1).getDay()
  const lastDay  = new Date(year, month, 0).getDate()
  const cells    = [...Array(firstDow).fill(null), ...Array.from({ length: lastDay }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  const byDate = appts.reduce<Record<string, Appt[]>>((acc, a) => {
    acc[a.scheduled_date] = [...(acc[a.scheduled_date] ?? []), a]
    return acc
  }, {})

  const dayAppts = (byDate[selDate] ?? [])
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''))

  const selLabel = new Date(selDate + 'T00:00:00').toLocaleDateString('zh-TW', {
    month: 'long', day: 'numeric', weekday: 'long',
  })

  return (
    <div className="p-6">
      <AdminPageHeader
        title="預約管理"
        subtitle={`${year} 年 ${month} 月`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
            >
              <Plus size={15} /> 新增預約
            </button>
            <button onClick={load} className="p-2 rounded-xl hover:bg-surface text-slate-t">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      <div className="flex gap-6 items-start flex-col lg:flex-row">

        {/* ── Left: Mini Calendar ── */}
        <div className="shrink-0 w-full lg:w-72 bg-white rounded-2xl border border-border-t p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface text-slate-t">
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-ink">{year} 年 {month} 月</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface text-slate-t">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d, i) => (
              <div key={d} className={cn('text-center text-[11px] font-semibold py-1',
                i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-t')}>{d}</div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="h-11" />
                const date     = toDate(day)
                const dayList  = byDate[date] ?? []
                const isToday  = date === TODAY
                const isSel    = date === selDate
                const isWkend  = di === 0 || di === 6
                const hasPend  = dayList.some(a => a.status === 'pending')
                const hasCheck = dayList.some(a => a.status === 'checked_in')
                const hasConf  = dayList.some(a => ['confirmed','in_service','completed'].includes(a.status))

                return (
                  <button key={di} onClick={() => setSelDate(date)}
                    className={cn(
                      'h-11 flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all',
                      isSel   ? 'bg-primary text-white shadow-md' :
                      isToday ? 'bg-primary/10 text-primary font-bold' :
                      isWkend ? 'text-rose-400 hover:bg-rose-50' :
                      'text-ink hover:bg-surface'
                    )}
                  >
                    <span className="leading-none">{day}</span>
                    {dayList.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {hasCheck && <span className={cn('w-1.5 h-1.5 rounded-full', isSel ? 'bg-white' : 'bg-emerald-400')} />}
                        {hasPend  && <span className={cn('w-1.5 h-1.5 rounded-full', isSel ? 'bg-white' : 'bg-yellow-400')} />}
                        {hasConf  && <span className={cn('w-1.5 h-1.5 rounded-full', isSel ? 'bg-white' : 'bg-blue-400')} />}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-border-t grid grid-cols-2 gap-y-2">
            {[
              { dot: 'bg-emerald-400', label: '已報到' },
              { dot: 'bg-yellow-400',  label: '待確認' },
              { dot: 'bg-blue-400',    label: '已確認' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-t">
                <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
                {label}
              </div>
            ))}
          </div>

          {appts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-t">
              <p className="text-xs text-slate-t">本月共 <span className="font-bold text-ink">{appts.length}</span> 筆預約</p>
            </div>
          )}
        </div>

        {/* ── Right: Day appointments ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-ink">{selLabel}</h2>
              <p className="text-sm text-slate-t mt-0.5">
                {loading ? '載入中…' : dayAppts.length === 0 ? '這天沒有預約' : `共 ${dayAppts.length} 筆`}
              </p>
            </div>
          </div>

          {!loading && dayAppts.length === 0 && (
            <div className="bg-white rounded-2xl border border-border-t py-16 text-center">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-slate-t text-sm">這天沒有預約</p>
            </div>
          )}

          <div className="space-y-3">
            {dayAppts.map(a => (
              <ApptCard
                key={a.id}
                a={a}
                acting={acting}
                onAction={handleAction}
              />
            ))}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateApptDialog
          groomers={groomers}
          onClose={() => setShowCreate(false)}
          onCreated={() => void load()}
        />
      )}
    </div>
  )
}

function ApptCard({ a, acting, onAction }: {
  a: Appt
  acting: string | null
  onAction: (id: string, action: 'confirm' | 'reject', groomerId?: string) => Promise<void>
}) {
  const [confirmMode, setConfirmMode]         = useState(false)
  const [availableGroomers, setAvailableGroomers] = useState<Groomer[]>([])
  const [selectedGroomerId, setSelectedGroomerId] = useState('')

  const pet    = a.pets
  const member = a.members
  const cfg    = STATUS[a.status] ?? STATUS.confirmed
  const emoji  = pet?.species === 'cat' ? '🐱' : '🐶'

  // 客人已指定美容師 → 直接確認，不需 picker
  const hasGroomer = !!a.groomers

  function startConfirm() {
    if (hasGroomer) {
      // 已指定，直接送出
      void onAction(a.id, 'confirm')
      return
    }
    // 未指定，載入當天當時段有班的美容師
    const date = a.scheduled_date
    const time = a.scheduled_time?.slice(0, 5) ?? ''
    fetch(`/api/admin/groomers?date=${date}&time=${time}`)
      .then(r => r.json())
      .then((list: Groomer[]) => { setAvailableGroomers(Array.isArray(list) ? list : []) })
      .catch(() => setAvailableGroomers([]))
    setConfirmMode(true)
  }

  async function submitConfirm() {
    await onAction(a.id, 'confirm', selectedGroomerId || undefined)
    setConfirmMode(false)
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl border-2 overflow-hidden transition-all',
      a.status === 'checked_in' ? 'border-emerald-300' :
      a.status === 'pending'    ? 'border-yellow-300'  :
      a.status === 'in_service' ? 'border-primary/40'  :
      'border-transparent border border-border-t'
    )}>
      <div className="p-5 flex gap-5">
        {/* Time column */}
        <div className="shrink-0 text-center w-16">
          <p className="text-2xl font-black text-ink tabular-nums leading-none">
            {a.scheduled_time?.slice(0, 5) ?? '—'}
          </p>
          {a.estimated_price != null && (
            <p className="text-xs text-slate-t mt-2">NT$<br />{a.estimated_price.toLocaleString()}</p>
          )}
        </div>

        {/* Colored divider */}
        <div className={cn('w-1 rounded-full shrink-0', cfg.dot)} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-ink">{emoji} {pet?.name ?? '—'}</span>
                <span className="text-sm text-slate-t bg-surface px-2.5 py-0.5 rounded-full">{pet?.breed}</span>
                {pet?.weight && <span className="text-xs text-slate-t">{pet.weight} kg</span>}
              </div>
              <p className="text-sm text-slate-t mt-1">{member?.name}・{member?.phone}</p>
            </div>
            <span className={cn('text-xs font-bold px-3 py-1 rounded-full shrink-0 whitespace-nowrap', cfg.bg, cfg.text)}>
              {cfg.label}
            </span>
          </div>

          {pet?.allergies && pet.allergies.length > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-1.5 rounded-xl">
              ⚠️ 過敏：{pet.allergies.join('、')}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
            {a.grooming_services && (
              <span className="font-medium text-primary">{a.grooming_services.name}</span>
            )}
            {a.groomers && (
              <span className="text-slate-t flex items-center gap-1"><User size={12} /> {a.groomers.name}</span>
            )}
          </div>

          {a.notes && (
            <p className="text-sm text-slate-t bg-surface rounded-xl px-3 py-2 mt-3">
              💬 {a.notes}
            </p>
          )}
        </div>
      </div>

      {/* Confirm / Reject actions */}
      {a.status === 'pending' && !confirmMode && (
        <div className="grid grid-cols-2 divide-x divide-border-t border-t border-border-t">
          <button
            disabled={acting === a.id}
            onClick={() => void onAction(a.id, 'reject')}
            className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
          >
            <XCircle size={16} /> 拒絕
          </button>
          <button
            disabled={acting === a.id}
            onClick={startConfirm}
            className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-40 transition-colors"
          >
            <CheckCircle size={16} /> 確認預約
          </button>
        </div>
      )}

      {/* Groomer picker — 只有未指定美容師才顯示 */}
      {a.status === 'pending' && confirmMode && (
        <div className="border-t border-border-t p-4 bg-surface/50">
          <p className="text-xs font-semibold text-slate-t mb-1">指定美容師</p>
          {availableGroomers.length === 0 ? (
            <p className="text-xs text-amber-600 mb-3">⚠ 當天時段尚無美容師排班，仍可確認預約</p>
          ) : (
            <p className="text-xs text-slate-t mb-3">以下為當天時段有排班的美容師</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setSelectedGroomerId('')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all',
                selectedGroomerId === ''
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-t bg-white text-ink hover:border-primary/40'
              )}
            >
              不指定
            </button>
            {availableGroomers.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGroomerId(g.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all',
                  selectedGroomerId === g.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-t bg-white text-ink hover:border-primary/40'
                )}
              >
                {g.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setConfirmMode(false)}
              className="h-9 rounded-xl border border-border-t text-sm text-slate-t hover:bg-surface"
            >
              取消
            </button>
            <button
              disabled={acting === a.id}
              onClick={() => void submitConfirm()}
              className="h-9 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40"
            >
              {acting === a.id ? '確認中…' : '確認預約'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
