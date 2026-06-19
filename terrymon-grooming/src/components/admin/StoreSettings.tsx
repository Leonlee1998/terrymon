'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const DAY_NAMES = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

type DayHours = { is_open: boolean; open: string; close: string }
type BusinessHours = Record<string, DayHours>
type ShiftPreset = { key: string; label: string; start: string; end: string }

const DEFAULT_HOURS: BusinessHours = {
  '0': { is_open: false, open: '09:00', close: '18:00' },
  '1': { is_open: true,  open: '09:00', close: '18:00' },
  '2': { is_open: true,  open: '09:00', close: '18:00' },
  '3': { is_open: true,  open: '09:00', close: '18:00' },
  '4': { is_open: true,  open: '09:00', close: '18:00' },
  '5': { is_open: true,  open: '09:00', close: '18:00' },
  '6': { is_open: true,  open: '09:00', close: '13:00' },
}
const DEFAULT_PRESETS: ShiftPreset[] = [
  { key: 'full',      label: '全天', start: '09:00', end: '18:00' },
  { key: 'morning',   label: '上午', start: '09:00', end: '13:00' },
  { key: 'afternoon', label: '下午', start: '14:00', end: '18:00' },
]

export default function StoreSettings() {
  const [hours,   setHours]   = useState<BusinessHours>(DEFAULT_HOURS)
  const [presets, setPresets] = useState<ShiftPreset[]>(DEFAULT_PRESETS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((d: { business_hours?: BusinessHours; shift_presets?: ShiftPreset[] }) => {
        if (d.business_hours) setHours(d.business_hours)
        if (d.shift_presets)  setPresets(d.shift_presets)
      })
      .catch(() => toast.error('設定載入失敗'))
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessHours: hours, shiftPresets: presets }),
      })
      if (!res.ok) throw new Error()
      toast.success('設定已儲存')
    } catch {
      toast.error('儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  function setDay(dow: string, field: keyof DayHours, val: string | boolean) {
    setHours(h => ({ ...h, [dow]: { ...h[dow], [field]: val } }))
  }
  function setPreset(i: number, field: keyof ShiftPreset, val: string) {
    setPresets(p => p.map((x, j) => j === i ? { ...x, [field]: val } : x))
  }
  function addPreset() {
    setPresets(p => [...p, { key: `custom_${Date.now()}`, label: '新班次', start: '09:00', end: '18:00' }])
  }
  function removePreset(i: number) {
    setPresets(p => p.filter((_, j) => j !== i))
  }

  if (loading) return <div className="flex items-center gap-2 text-slate-t py-8"><Loader2 size={16} className="animate-spin" /> 載入中…</div>

  return (
    <div className="space-y-8">

      {/* 營業時間 */}
      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="px-5 py-4 border-b border-border-t">
          <p className="font-bold text-ink">營業時間</p>
          <p className="text-xs text-slate-t mt-0.5">設定每天的開關店時間及公休日</p>
        </div>
        <div className="divide-y divide-border-t">
          {[1,2,3,4,5,6,0].map(dow => {
            const d = hours[String(dow)] ?? DEFAULT_HOURS[String(dow)]
            const isWeekend = dow === 0 || dow === 6
            return (
              <div key={dow} className={cn('grid grid-cols-[80px_48px_1fr] gap-4 px-5 py-3 items-center', !d.is_open && 'opacity-50')}>
                <p className={cn('font-medium text-sm', isWeekend ? 'text-rose-500' : 'text-ink')}>{DAY_NAMES[dow]}</p>
                <Switch checked={d.is_open} onCheckedChange={v => setDay(String(dow), 'is_open', v)} />
                <div className="flex items-center gap-2">
                  <Input type="time" value={d.open}  onChange={e => setDay(String(dow), 'open',  e.target.value)} disabled={!d.is_open} className="h-8 w-28 text-sm" />
                  <span className="text-slate-t text-sm">–</span>
                  <Input type="time" value={d.close} onChange={e => setDay(String(dow), 'close', e.target.value)} disabled={!d.is_open} className="h-8 w-28 text-sm" />
                  {!d.is_open && <span className="text-xs text-slate-t">公休</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 班次設定 */}
      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="px-5 py-4 border-b border-border-t flex items-center justify-between">
          <div>
            <p className="font-bold text-ink">班次設定</p>
            <p className="text-xs text-slate-t mt-0.5">定義排班時的班次名稱與對應時間</p>
          </div>
          <button onClick={addPreset} className="flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary-bg">
            <Plus size={13} /> 新增班次
          </button>
        </div>
        <div className="divide-y divide-border-t">
          {presets.map((p, i) => (
            <div key={p.key} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 px-5 py-3 items-center">
              <Input
                value={p.label}
                onChange={e => setPreset(i, 'label', e.target.value)}
                className="h-8 text-sm font-medium"
                placeholder="班次名稱"
              />
              <div className="flex items-center gap-1.5">
                <Input type="time" value={p.start} onChange={e => setPreset(i, 'start', e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-t text-sm shrink-0">到</span>
                <Input type="time" value={p.end} onChange={e => setPreset(i, 'end', e.target.value)} className="h-8 text-sm" />
              </div>
              <button onClick={() => removePreset(i)} className="p-1.5 text-slate-t hover:text-rose-500 rounded-lg hover:bg-rose-50">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="bg-primary text-white">
        {saving ? <><Loader2 size={14} className="animate-spin mr-2" />儲存中…</> : '儲存設定'}
      </Button>
    </div>
  )
}
