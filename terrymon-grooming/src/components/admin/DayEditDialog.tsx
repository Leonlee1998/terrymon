'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ShiftRow, Groomer, Closure } from './MonthlySchedule'

const SHIFT_OPTS = [
  { label: '全天', startTime: '09:00', endTime: '18:00', cls: 'bg-primary-bg text-primary border-primary/30' },
  { label: '上午', startTime: '09:00', endTime: '13:00', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  { label: '下午', startTime: '14:00', endTime: '18:00', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
]

function getLabel(s: ShiftRow | undefined): string | null {
  if (!s || s.is_day_off) return null
  const st = s.start_time?.slice(0, 5)
  const et = s.end_time?.slice(0, 5)
  if (st === '09:00' && et === '18:00') return '全天'
  if (st === '09:00' && et === '13:00') return '上午'
  if (st === '14:00' && et === '18:00') return '下午'
  return `${st}–${et}`
}

interface Props {
  date: string
  groomers: Groomer[]
  shifts: ShiftRow[]
  closures: Closure[]
  onClose: () => void
  onShiftSaved: (s: ShiftRow) => void
  onClosureChanged: (date: string, closure: Closure | null) => void
}

export default function DayEditDialog({ date, groomers, shifts, closures, onClose, onShiftSaved, onClosureChanged }: Props) {
  const [savingGroomer, setSavingGroomer] = useState<string | null>(null)
  const [savingClosure, setSavingClosure] = useState(false)
  const [reason, setReason] = useState('')

  const [y, m, d] = date.split('-')
  const dow      = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('zh-TW', { weekday: 'long' })
  const closure  = closures.find(c => c.date === date) ?? null
  const isClosed = !!closure

  async function toggleClosure(open: boolean) {
    setSavingClosure(true)
    try {
      if (open) {
        await fetch('/api/admin/closures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, reason: reason || null }),
        })
        onClosureChanged(date, { id: Date.now().toString(), date, reason: reason || null })
        toast.success('已設為店休')
      } else {
        await fetch(`/api/admin/closures?date=${date}`, { method: 'DELETE' })
        onClosureChanged(date, null)
        setReason('')
        toast.success('已取消店休')
      }
    } catch {
      toast.error('操作失敗')
    } finally {
      setSavingClosure(false)
    }
  }

  async function handleShiftSelect(groomerId: string, opt: typeof SHIFT_OPTS[0]) {
    setSavingGroomer(groomerId)
    try {
      const res = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groomerId, workDate: date, startTime: opt.startTime, endTime: opt.endTime, isDayOff: false }),
      })
      if (!res.ok) throw new Error()
      onShiftSaved({ id: Date.now().toString(), groomer_id: groomerId, work_date: date, start_time: opt.startTime, end_time: opt.endTime, is_day_off: false, note: null })
    } catch {
      toast.error('儲存失敗')
    } finally {
      setSavingGroomer(null)
    }
  }

  async function clearShift(groomerId: string) {
    setSavingGroomer(groomerId)
    try {
      await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groomerId, workDate: date, startTime: '09:00', endTime: '18:00', isDayOff: true }),
      })
      onShiftSaved({ id: Date.now().toString(), groomer_id: groomerId, work_date: date, start_time: '09:00', end_time: '18:00', is_day_off: true, note: null })
    } catch {
      toast.error('清除失敗')
    } finally {
      setSavingGroomer(null)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{Number(m)} 月 {Number(d)} 日・{dow}</DialogTitle>
        </DialogHeader>

        {/* 店休 toggle */}
        <div className={cn('rounded-xl px-4 py-3 flex flex-col gap-2', isClosed ? 'bg-rose-50 border border-rose-200' : 'bg-surface border border-border-t')}>
          <div className="flex items-center justify-between">
            <span className={cn('text-sm font-semibold', isClosed ? 'text-rose-600' : 'text-ink')}>全店公休</span>
            {savingClosure
              ? <Loader2 size={16} className="animate-spin text-slate-t" />
              : <Switch checked={isClosed} onCheckedChange={toggleClosure} />
            }
          </div>
          {(!isClosed || !closure?.reason) && (
            <Input
              value={isClosed ? (closure?.reason ?? '') : reason}
              onChange={e => setReason(e.target.value)}
              onBlur={() => {
                if (isClosed && reason !== (closure?.reason ?? '')) {
                  void toggleClosure(true)
                }
              }}
              placeholder="原因（選填）：中秋節、颱風假…"
              className="h-8 text-sm"
              disabled={isClosed && !!closure?.reason}
            />
          )}
          {isClosed && closure?.reason && (
            <p className="text-sm text-rose-500">{closure.reason}</p>
          )}
        </div>

        {/* 美容師排班 */}
        {!isClosed && (
          <div className="space-y-2.5 mt-1">
            {groomers.filter(g => g.is_active).map(g => {
              const shift   = shifts.find(s => s.groomer_id === g.id && s.work_date === date)
              const current = getLabel(shift)
              return (
                <div key={g.id} className="flex items-center gap-2">
                  <p className="w-16 font-medium text-ink text-sm shrink-0">{g.name}</p>
                  <div className="flex gap-1.5 flex-wrap flex-1">
                    {SHIFT_OPTS.map(opt => (
                      <button key={opt.label}
                        disabled={savingGroomer === g.id}
                        onClick={() => handleShiftSelect(g.id, opt)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                          current === opt.label
                            ? opt.cls + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-white border-border-t text-slate-t hover:bg-surface'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                    {current && (
                      <button
                        disabled={savingGroomer === g.id}
                        onClick={() => clearShift(g.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border border-border-t text-slate-t hover:border-rose-300 hover:text-rose-500"
                      >
                        清除
                      </button>
                    )}
                    {savingGroomer === g.id && <Loader2 size={14} className="animate-spin text-slate-t self-center" />}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {isClosed && (
          <p className="text-xs text-rose-400 text-center py-2">店休日無法排班</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
