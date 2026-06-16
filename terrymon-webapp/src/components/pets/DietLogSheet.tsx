'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { PetDailyLog, DietLogData } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MEAL_TIMES = [
  { key: 'morning', label: '早餐' },
  { key: 'noon',    label: '午餐' },
  { key: 'evening', label: '晚餐' },
]

interface Props {
  petId: string
  logs: PetDailyLog[]
  open: boolean
  onOpenChange: (o: boolean) => void
  onAdded: (log: PetDailyLog) => void
}

export default function DietLogSheet({ petId, logs, open, onOpenChange, onAdded }: Props) {
  const [mealTime, setMealTime] = useState('morning')
  const [customLabel, setCustomLabel] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [foodName, setFoodName] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const dietLogs = logs.filter(l => l.type === 'diet').map(l => ({ ...l, data: l.data as DietLogData }))

  async function handleSave() {
    const label = isCustom ? customLabel.trim() : MEAL_TIMES.find(m => m.key === mealTime)?.label ?? ''
    if (!foodName.trim()) { toast.error('請填寫食物名稱'); return }
    if (isCustom && !label) { toast.error('請填寫時段名稱'); return }
    setSaving(true)
    try {
      const data: DietLogData = {
        mealTime: isCustom ? 'custom' : mealTime,
        mealTimeLabel: label,
        foodName: foodName.trim(),
        amount: amount.trim() || undefined,
      }
      const log = await api.addDailyLog(petId, { type: 'diet', data })
      onAdded(log)
      setFoodName(''); setAmount('')
      toast.success(`${label} 已記錄`)
    } catch { toast.error('記錄失敗') } finally { setSaving(false) }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pb-10 pt-2">
        <SheetHeader className="mb-4 pt-2">
          <SheetTitle className="text-left text-lg font-black text-ink">🍽️ 飲食記錄</SheetTitle>
        </SheetHeader>

        {/* Today's logs */}
        {dietLogs.length > 0 && (
          <div className="mb-5 space-y-2">
            {dietLogs.map(l => (
              <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-border-t bg-white px-4 py-3">
                <span className="min-w-[36px] rounded-full bg-primary-bg px-2 py-0.5 text-center text-[11px] font-bold text-primary">
                  {l.data.mealTimeLabel}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{l.data.foodName}</p>
                  {l.data.amount && <p className="text-xs text-slate-t">{l.data.amount}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <div className="space-y-3 rounded-2xl border border-border-t bg-surface p-4">
          <p className="text-sm font-bold text-ink">新增一筆</p>

          {/* Meal time selector */}
          <div className="flex flex-wrap gap-2">
            {MEAL_TIMES.map(m => (
              <button key={m.key}
                onClick={() => { setMealTime(m.key); setIsCustom(false) }}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${!isCustom && mealTime === m.key ? 'bg-primary text-white' : 'border border-border-t text-slate-t'}`}>
                {m.label}
              </button>
            ))}
            <button
              onClick={() => setIsCustom(true)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${isCustom ? 'bg-primary text-white' : 'border border-border-t text-slate-t'}`}>
              + 新增時段
            </button>
          </div>

          {isCustom && (
            <Input value={customLabel} onChange={e => setCustomLabel(e.target.value)}
              placeholder="時段名稱（如：睡前點心）" />
          )}
          <Input value={foodName} onChange={e => setFoodName(e.target.value)} placeholder="食物名稱（必填）" />
          <Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="份量（選填，如：半碗、30g）" />

          <Button onClick={handleSave} disabled={saving || !foodName.trim()}
            className="w-full gap-1.5 bg-primary text-white">
            <Plus size={15} /> 記錄
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
