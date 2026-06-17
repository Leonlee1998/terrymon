'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { PetDailyLog, PoopLogData } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DailyPhotoUpload from './DailyPhotoUpload'

const CONSISTENCY = [
  { key: 'normal',      label: '正常',  color: 'text-green-600 bg-green-50 border-green-200' },
  { key: 'soft',        label: '偏軟',  color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { key: 'loose',       label: '拉稀',  color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { key: 'constipated', label: '便秘',  color: 'text-slate-600 bg-slate-50 border-slate-200' },
]

const COLORS = [
  { key: 'brown',  label: '棕色', dot: '🟤' },
  { key: 'yellow', label: '黃色', dot: '🟡' },
  { key: 'black',  label: '黑色', dot: '⚫' },
  { key: 'bloody', label: '血色', dot: '🔴' },
]

const CONSISTENCY_LABEL: Record<string, string> = {
  normal: '正常', soft: '偏軟', loose: '拉稀', constipated: '便秘',
}

interface Props {
  petId: string
  logs: PetDailyLog[]
  logDate: string
  open: boolean
  onOpenChange: (o: boolean) => void
  onAdded: (log: PetDailyLog) => void
}

export default function PoopLogSheet({ petId, logs, logDate, open, onOpenChange, onAdded }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [consistency, setConsistency] = useState<PoopLogData['consistency']>('normal')
  const [color, setColor] = useState<PoopLogData['color']>('brown')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [date, setDate] = useState(logDate)
  const [saving, setSaving] = useState(false)

  if (date !== logDate && !open) setDate(logDate)

  const poopLogs = logs.filter(l => l.type === 'poop').map(l => ({ ...l, data: l.data as PoopLogData }))
  const dateLabel = logDate === today ? '今天' : logDate

  async function handleSave() {
    setSaving(true)
    try {
      const data: PoopLogData = { consistency, color }
      const log = await api.addDailyLog(petId, { type: 'poop', data, notes: notes.trim() || undefined, logDate: date, photoUrls: photos })
      onAdded(log)
      setNotes(''); setPhotos([])
      toast.success('已記錄')
    } catch { toast.error('記錄失敗') } finally { setSaving(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pb-10 pt-2">
        <SheetHeader className="mb-4 pt-2">
          <SheetTitle className="text-left text-lg font-black text-ink">💩 糞便記錄</SheetTitle>
        </SheetHeader>

        {poopLogs.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs text-slate-t">{dateLabel} · {poopLogs.length} 次</p>
            <div className="flex flex-wrap gap-2">
              {poopLogs.map((l, i) => {
                const c = CONSISTENCY.find(x => x.key === l.data.consistency)
                const col = COLORS.find(x => x.key === l.data.color)
                return (
                  <div key={l.id} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${c?.color ?? ''}`}>
                    <span>{col?.dot}</span>
                    <span className="font-medium">{CONSISTENCY_LABEL[l.data.consistency]}</span>
                    <span className="text-xs opacity-70">第{i + 1}次</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 rounded-2xl border border-border-t bg-surface p-4">
          <p className="text-sm font-bold text-ink">新增一筆</p>

          <div>
            <p className="mb-1 text-xs text-slate-t">紀錄日期</p>
            <Input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} />
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-t">性狀</p>
            <div className="grid grid-cols-4 gap-2">
              {CONSISTENCY.map(c => (
                <button key={c.key} onClick={() => setConsistency(c.key as PoopLogData['consistency'])}
                  className={`rounded-xl border py-2 text-sm font-medium transition-colors ${consistency === c.key ? c.color : 'border-border-t text-slate-t'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-t">顏色</p>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map(c => (
                <button key={c.key} onClick={() => setColor(c.key as PoopLogData['color'])}
                  className={`flex flex-col items-center rounded-xl border py-2 text-sm transition-colors ${color === c.key ? 'border-primary bg-primary-bg' : 'border-border-t'}`}>
                  <span>{c.dot}</span>
                  <span className="mt-0.5 text-xs text-slate-t">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <DailyPhotoUpload value={photos} onChange={setPhotos} />

          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="備註（選填）" />

          <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5 bg-primary text-white">
            <Plus size={15} /> 記錄
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
