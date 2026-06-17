'use client'

import { useState, useEffect } from 'react'
import { Bell, CalendarPlus, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { VaccineReminder } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PRESETS = ['心絲蟲預防', '體內驅蟲', '體外驅蟲', '跳蚤蜱蟲防治']

function downloadICS(name: string, date: string) {
  const d = date.replace(/-/g, '')
  const content = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TerryMon//ZH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${d}`,
    `SUMMARY:🐾 ${name}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY',
    `DESCRIPTION:${name} 提醒`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${name}.ics`
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

function fmtDate(d?: string) {
  if (!d) return '未設定'
  const [y, m, day] = d.split('-')
  return `${y}/${m}/${day}`
}

function addOneMonth(date: string) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
}

interface Props {
  petId: string
  reminders: VaccineReminder[]
  open: boolean
  onOpenChange: (o: boolean) => void
  onUpdate: (reminders: VaccineReminder[]) => void
}

export default function DewormerSheet({ petId, reminders, open, onOpenChange, onUpdate }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [name, setName] = useState('')
  const [lastDate, setLastDate] = useState(today)
  const [nextDate, setNextDate] = useState(() => addOneMonth(today))
  const [adding, setAdding] = useState(false)

  useEffect(() => { if (lastDate) setNextDate(addOneMonth(lastDate)) }, [lastDate])

  async function handleAdd() {
    if (!name.trim()) { toast.error('請填寫名稱'); return }
    setAdding(true)
    try {
      const item = await api.addVaccineReminder(petId, {
        name: name.trim(), nextDueDate: nextDate || undefined,
        lastDoneDate: lastDate || undefined, category: 'dewormer',
      })
      onUpdate([...reminders, item])
      setName(''); setLastDate(today); setNextDate(addOneMonth(today))
      toast.success('已新增驅蟲紀錄')
    } catch { toast.error('新增失敗') } finally { setAdding(false) }
  }

  async function handleDelete(id: string) {
    await api.deleteVaccineReminder(id)
    onUpdate(reminders.filter(r => r.id !== id))
    toast.success('已刪除')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pb-10 pt-2">
        <SheetHeader className="mb-4 pt-2">
          <SheetTitle className="text-left text-lg font-black text-ink">🛡️ 驅蟲紀錄</SheetTitle>
        </SheetHeader>

        <div className="mb-5 space-y-2">
          {reminders.length === 0 && <p className="py-4 text-center text-sm text-slate-t">尚無驅蟲紀錄</p>}
          {reminders.map(r => {
            const overdue = r.nextDueDate && r.nextDueDate < today
            return (
              <div key={r.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${overdue ? 'border-red-200 bg-red-50' : 'border-border-t bg-white'}`}>
                <Bell size={16} className={overdue ? 'text-error' : 'text-primary'} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm">{r.name}</p>
                  <p className="text-xs text-slate-t">
                    下次：<span className={overdue ? 'font-bold text-error' : ''}>{fmtDate(r.nextDueDate)}</span>
                    {r.lastDoneDate && ` ｜ 上次：${fmtDate(r.lastDoneDate)}`}
                  </p>
                </div>
                {r.nextDueDate && (
                  <button onClick={() => downloadICS(r.name, r.nextDueDate!)}
                    className="rounded-lg p-1.5 text-primary hover:bg-primary-bg" title="加入行事曆">
                    <CalendarPlus size={15} />
                  </button>
                )}
                <button onClick={() => handleDelete(r.id)}
                  className="rounded-lg p-1.5 text-slate-t hover:text-error">
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>

        <div className="space-y-3 rounded-2xl border border-border-t bg-surface p-4">
          <p className="text-sm font-bold text-ink">新增驅蟲紀錄</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button key={p} onClick={() => setName(p)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${name === p ? 'border-primary bg-primary-bg text-primary' : 'border-border-t text-slate-t'}`}>
                {p}
              </button>
            ))}
          </div>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="或自訂藥品名稱" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-xs text-slate-t">施打日期</p>
              <Input type="date" value={lastDate} onChange={e => setLastDate(e.target.value)} />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-t">下次提醒（預設 +1 個月）</p>
              <Input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={adding || !name.trim()}
            className="w-full gap-1.5 bg-primary text-white">
            <Plus size={15} /> 新增
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
