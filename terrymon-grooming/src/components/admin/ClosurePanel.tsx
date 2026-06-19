'use client'
import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { TW_HOLIDAYS } from '@/lib/holidays'
import type { Closure } from './MonthlySchedule'

interface Props {
  year: number; month: number
  closures: Closure[]
  onClosureChanged: (date: string, closure: Closure | null) => void
}

export default function ClosurePanel({ year, month, closures, onClosureChanged }: Props) {
  const [saving, setSaving] = useState<string | null>(null)

  const pad = (n: number) => String(n).padStart(2, '0')
  const prefix = `${year}-${pad(month)}-`
  const holidays = Object.entries(TW_HOLIDAYS)
    .filter(([d]) => d.startsWith(prefix))
    .map(([date, name]) => ({ date, name }))

  async function addClosure(date: string, reason: string | null) {
    setSaving(date)
    try {
      const res = await fetch('/api/admin/closures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, reason }),
      })
      if (!res.ok) throw new Error()
      onClosureChanged(date, { id: Date.now().toString(), date, reason })
      toast.success('已設為店休')
    } catch {
      toast.error('設定失敗')
    } finally {
      setSaving(null)
    }
  }

  async function removeClosure(date: string) {
    setSaving(date)
    try {
      const res = await fetch(`/api/admin/closures?date=${date}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onClosureChanged(date, null)
      toast.success('已取消店休')
    } catch {
      toast.error('操作失敗')
    } finally {
      setSaving(null)
    }
  }

  const fmtDate = (d: string) => d.slice(5).replace('-', '/') // "06/18"

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* 國定假日 */}
      <div className="rounded-xl p-4 border border-orange-100 bg-orange-50">
        <p className="font-semibold text-orange-700 text-sm mb-2">本月國定假日</p>
        {holidays.length === 0
          ? <p className="text-xs text-slate-400">本月無國定假日</p>
          : <div className="space-y-1.5">
              {holidays.map(({ date, name }) => {
                const closed = closures.some(c => c.date === date)
                const busy   = saving === date
                return (
                  <div key={date} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-ink">{fmtDate(date)} <span className="text-orange-600">{name}</span></span>
                    <button
                      disabled={busy}
                      onClick={() => closed ? removeClosure(date) : addClosure(date, name)}
                      className={cn(
                        'shrink-0 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors',
                        closed
                          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                          : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-100'
                      )}
                    >
                      {busy && <Loader2 size={10} className="animate-spin" />}
                      {closed ? '已設店休 ✓' : '設為店休'}
                    </button>
                  </div>
                )
              })}
            </div>
        }
      </div>

      {/* 本月店休 */}
      <div className="rounded-xl p-4 border border-rose-100 bg-rose-50">
        <p className="font-semibold text-rose-700 text-sm mb-2">本月店休（{closures.length} 天）</p>
        {closures.length === 0
          ? <p className="text-xs text-slate-400">本月尚無設定店休</p>
          : <div className="space-y-1.5">
              {[...closures].sort((a,b) => a.date.localeCompare(b.date)).map(c => (
                <div key={c.date} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-ink">
                    {fmtDate(c.date)}
                    {c.reason && <span className="text-rose-500 ml-1">{c.reason}</span>}
                  </span>
                  <button
                    disabled={saving === c.date}
                    onClick={() => removeClosure(c.date)}
                    className="shrink-0 p-0.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    {saving === c.date
                      ? <Loader2 size={12} className="animate-spin" />
                      : <X size={12} />
                    }
                  </button>
                </div>
              ))}
            </div>
        }
        <p className="text-[10px] text-slate-400 mt-3">點月曆上的日期可設定細節與排班</p>
      </div>
    </div>
  )
}
