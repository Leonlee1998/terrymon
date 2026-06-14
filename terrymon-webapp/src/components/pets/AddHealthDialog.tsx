'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type Metric = 'weight' | 'temperature' | 'blood_sugar' | 'heart_rate' | 'bp_systolic' | 'bp_diastolic'

const METRICS: { value: Metric; label: string; unit: string }[] = [
  { value: 'weight',       label: '體重',   unit: 'kg' },
  { value: 'temperature',  label: '體溫',   unit: '°C' },
  { value: 'blood_sugar',  label: '血糖',   unit: 'mg/dL' },
  { value: 'heart_rate',   label: '心率',   unit: 'bpm' },
  { value: 'bp_systolic',  label: '收縮壓', unit: 'mmHg' },
  { value: 'bp_diastolic', label: '舒張壓', unit: 'mmHg' },
]

interface Props {
  petId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export default function AddHealthDialog({ petId, open, onOpenChange, onSaved }: Props) {
  const [metric, setMetric] = useState<Metric>('weight')
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const unitLabel = METRICS.find(m => m.value === metric)?.unit ?? ''

  async function handleSave() {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) { toast.error('請輸入有效數值'); return }
    setSaving(true)
    try {
      await api.addHealthData(petId, { metric, value: num, unit: unitLabel, note: note.trim() || undefined })
      toast.success('健康數據已新增')
      setValue('')
      setNote('')
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('新增失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>新增健康量測</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">量測項目</span>
            <select
              value={metric}
              onChange={e => setMetric(e.target.value as Metric)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {METRICS.map(m => (
                <option key={m.value} value={m.value}>{m.label}（{m.unit}）</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">數值（{unitLabel}）</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="請輸入數值"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">備註（選填）</span>
            <Input value={note} onChange={e => setNote(e.target.value)} placeholder="例：飯後測量" />
          </label>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="ml-auto">
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !value}
              className="bg-primary text-white hover:bg-primary-hover"
            >
              {saving ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
