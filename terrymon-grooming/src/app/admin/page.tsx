'use client'
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Bell, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'

type Appt = {
  id: string
  status: string
  scheduled_date: string
  scheduled_time: string | null
  estimated_price: number | null
  notes: string | null
  members: { name: string; phone: string } | null
  pets: { name: string; breed: string; weight: number; allergies: string[]; species: string } | null
  groomers: { name: string } | null
  grooming_services: { name: string } | null
}

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:     { label: '待確認', bg: 'bg-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-400' },
  confirmed:   { label: '已確認', bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  checked_in:  { label: '已報到', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  in_service:  { label: '進行中', bg: 'bg-primary/10',  text: 'text-primary',     dot: 'bg-primary' },
  completed:   { label: '已完成', bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-300' },
  cancelled:   { label: '已取消', bg: 'bg-gray-100',    text: 'text-gray-400',    dot: 'bg-gray-200' },
}

export default function AdminDashboard() {
  const [today,   setToday]   = useState<Appt[]>([])
  const [pending, setPending] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/appointments'),
        fetch('/api/admin/appointments?status=pending'),
      ])
      const [d1, d2] = await Promise.all([r1.json(), r2.json()])
      setToday(Array.isArray(d1) ? d1 : [])
      setPending(Array.isArray(d2) ? d2 : [])
      setUpdated(new Date())
    } catch {
      toast.error('載入失敗，請重新整理')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAction = useCallback(async (id: string, action: string) => {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json() as { error?: string }
    if (!res.ok) {
      toast.error(data.error ?? '操作失敗')
      return false
    }
    void load()
    return true
  }, [load])

  useEffect(() => {
    void load()
    const id = setInterval(() => void load(), 30_000)
    return () => clearInterval(id)
  }, [load])

  const byStatus = (s: string) => today.filter(a => a.status === s)
  const checkedIn   = byStatus('checked_in')
  const inProgress  = byStatus('in_service')
  const confirmed   = byStatus('confirmed')
  const completed   = byStatus('completed')
  const todayDate   = new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <AdminPageHeader
        title="今日工作台"
        subtitle={todayDate}
        action={
          <div className="flex items-center gap-3">
            {updated && (
              <span className="text-xs text-slate-t hidden sm:block">
                {updated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 更新
              </span>
            )}
            <button onClick={load} className="p-2 rounded-xl hover:bg-surface text-slate-t" title="重新整理">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '今日預約', value: today.filter(a => a.status !== 'cancelled').length, cls: 'text-ink' },
          { label: '等待服務', value: checkedIn.length,  cls: 'text-emerald-600', ring: checkedIn.length > 0 },
          { label: '進行中',  value: inProgress.length, cls: 'text-primary' },
          { label: '已完成',  value: completed.length,  cls: 'text-gray-400' },
        ].map(({ label, value, cls, ring }) => (
          <div key={label} className={`bg-white rounded-2xl border p-4 transition-all ${ring ? 'border-emerald-300 shadow-emerald-100 shadow-md' : 'border-border-t'}`}>
            <p className={`text-3xl font-black ${cls}`}>{value}</p>
            <p className="text-xs text-slate-t mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── 已報到等待 — 最高優先 ── */}
      {checkedIn.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-emerald-600 animate-bounce" />
            <h2 className="font-bold text-ink">等待服務（{checkedIn.length} 位已報到）</h2>
          </div>
          <div className="space-y-2">
            {checkedIn.map(a => <WaitingCard key={a.id} a={a} onAction={handleAction} />)}
          </div>
        </section>
      )}

      {/* ── 今日排程 ── */}
      <section>
        <h2 className="font-bold text-ink mb-3">今日排程</h2>
        {[...inProgress, ...confirmed, ...completed].length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-t px-6 py-10 text-center">
            <p className="text-slate-t text-sm">今日尚無其他排程</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border-t overflow-hidden divide-y divide-border-t">
            {[...inProgress, ...confirmed, ...completed]
              .sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''))
              .map(a => <ScheduleRow key={a.id} a={a} onAction={handleAction} />)}
          </div>
        )}
      </section>

      {/* ── 待確認新預約 ── */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-500" />
              <h2 className="font-bold text-ink">待確認預約（{pending.length} 筆）</h2>
            </div>
            <Link href="/admin/appointments" className="text-xs text-primary hover:underline">全部查看 →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-yellow-200 overflow-hidden divide-y divide-border-t">
            {pending.slice(0, 4).map(a => <ScheduleRow key={a.id} a={a} onAction={handleAction} />)}
            {pending.length > 4 && (
              <div className="px-4 py-3 text-center">
                <Link href="/admin/appointments" className="text-xs text-primary hover:underline">
                  還有 {pending.length - 4} 筆待確認 →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && today.length === 0 && pending.length === 0 && (
        <div className="text-center py-16 text-slate-t">
          <p className="text-4xl mb-3">☀️</p>
          <p className="font-medium">今日暫無預約</p>
        </div>
      )}
    </div>
  )
}

type ActionFn = (id: string, action: string) => Promise<boolean>

function WaitingCard({ a, onAction }: { a: Appt; onAction: ActionFn }) {
  const [busy, setBusy] = useState(false)
  const pet = a.pets
  const member = a.members

  async function startService() {
    setBusy(true)
    const ok = await onAction(a.id, 'start_service')
    if (ok) toast.success(`${pet?.name ?? '寵物'} 開始服務`)
    setBusy(false)
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-300 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">
        {pet?.species === 'cat' ? '🐱' : '🐶'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-ink">{pet?.name ?? '—'}</p>
          <span className="text-xs text-slate-t bg-surface px-2 py-0.5 rounded-full">{pet?.breed}</span>
          {pet?.allergies && pet.allergies.length > 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              ⚠️ {pet.allergies.join('、')}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-t mt-0.5">{member?.name}・{a.scheduled_time?.slice(0,5)}</p>
        {a.grooming_services && <p className="text-xs text-primary mt-0.5">{a.grooming_services.name}</p>}
      </div>
      <button
        onClick={() => void startService()}
        disabled={busy}
        className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : null}
        開始服務
      </button>
    </div>
  )
}

function ScheduleRow({ a, onAction }: { a: Appt; onAction: ActionFn }) {
  const [busy, setBusy] = useState(false)
  const cfg = STATUS_CFG[a.status] ?? STATUS_CFG.pending
  const pet = a.pets
  const member = a.members

  async function completeService() {
    setBusy(true)
    const ok = await onAction(a.id, 'complete')
    if (ok) toast.success(`${pet?.name ?? '寵物'} 服務完成`)
    setBusy(false)
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${a.status === 'cancelled' ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-2 w-20 shrink-0">
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="text-sm font-semibold text-ink">{a.scheduled_time?.slice(0,5) ?? '—'}</span>
      </div>
      <Clock size={12} className="text-slate-t shrink-0 hidden sm:block" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm text-ink">{pet?.name ?? '—'}</span>
          <span className="text-xs text-slate-t">{pet?.breed}</span>
        </div>
        <p className="text-xs text-slate-t truncate">
          {member?.name}
          {a.grooming_services && ` · ${a.grooming_services.name}`}
          {a.status === 'pending' && ` · ${a.scheduled_date}`}
        </p>
      </div>
      {a.status === 'in_service' ? (
        <button
          onClick={() => void completeService()}
          disabled={busy}
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary border border-primary px-3 py-1 rounded-full hover:bg-primary/10 disabled:opacity-60"
        >
          {busy ? <Loader2 size={11} className="animate-spin" /> : null}
          完成服務
        </button>
      ) : (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
      )}
    </div>
  )
}
