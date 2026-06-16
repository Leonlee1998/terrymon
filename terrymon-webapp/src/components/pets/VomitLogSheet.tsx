'use client'

import { useState } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { PetDailyLog, VomitLogData } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CONTENTS = [
  { key: 'food',  label: '未消化食物', alert: false },
  { key: 'bile',  label: '胃液 / 膽汁', alert: false },
  { key: 'blood', label: '含血',        alert: true },
  { key: 'hair',  label: '毛球',        alert: false },
  { key: 'other', label: '其他',        alert: false },
]

interface Props {
  petId: string
  logs: PetDailyLog[]
  open: boolean
  onOpenChange: (o: boolean) => void
  onAdded: (log: PetDailyLog) => void
}

export default function VomitLogSheet({ petId, logs, open, onOpenChange, onAdded }: Props) {
  const [content, setContent] = useState<VomitLogData['content']>('food')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const vomitLogs = logs.filter(l => l.type === 'vomit').map(l => ({ ...l, data: l.data as VomitLogData }))
  const hasBlood = vomitLogs.some(l => l.data.content === 'blood')

  async function handleSave() {
    setSaving(true)
    try {
      const found = CONTENTS.find(c => c.key === content)!
      const data: VomitLogData = { content, contentLabel: found.label }
      const log = await api.addDailyLog(petId, { type: 'vomit', data, notes: notes.trim() || undefined })
      onAdded(log)
      setNotes('')
      toast.success('已記錄')
    } catch { toast.error('記錄失敗') } finally { setSaving(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pb-10 pt-2">
        <SheetHeader className="mb-4 pt-2">
          <SheetTitle className="text-left text-lg font-black text-ink">🤢 嘔吐記錄</SheetTitle>
        </SheetHeader>

        {/* Today's logs */}
        {vomitLogs.length > 0 && (
          <div className="mb-4">
            {hasBlood && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-error">
                <AlertTriangle size={14} />
                <span className="font-semibold">含血嘔吐，建議盡快就診</span>
              </div>
            )}
            <p className="mb-2 text-xs text-slate-t">今日 {vomitLogs.length} 筆</p>
            <div className="flex flex-wrap gap-2">
              {vomitLogs.map((l, i) => {
                const isAlert = l.data.content === 'blood'
                return (
                  <span key={l.id} className={`rounded-full border px-3 py-1 text-sm font-medium ${isAlert ? 'border-red-300 bg-red-50 text-error' : 'border-border-t text-slate-t'}`}>
                    第{i + 1}次：{l.data.contentLabel}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-3 rounded-2xl border border-border-t bg-surface p-4">
          <p className="text-sm font-bold text-ink">新增一筆</p>

          <div className="grid grid-cols-2 gap-2">
            {CONTENTS.map(c => (
              <button key={c.key} onClick={() => setContent(c.key as VomitLogData['content'])}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                  content === c.key
                    ? c.alert ? 'border-red-400 bg-red-50 text-error' : 'border-primary bg-primary-bg text-primary'
                    : 'border-border-t text-slate-t'
                }`}>
                {c.alert && <AlertTriangle size={12} className="mb-0.5 inline mr-1" />}
                {c.label}
              </button>
            ))}
          </div>

          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="備註（選填）" />

          <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5 bg-primary text-white">
            <Plus size={15} /> 記錄
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
