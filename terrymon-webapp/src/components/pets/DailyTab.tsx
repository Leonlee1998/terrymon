'use client'

import { useEffect, useState } from 'react'
import { Syringe, UtensilsCrossed, Droplets, Wind } from 'lucide-react'
import { api } from '@/services/api'
import type { PetDailyLog, VaccineReminder, DietLogData, PoopLogData, VomitLogData } from '@/types'
import VaccineSheet from './VaccineSheet'
import DietLogSheet from './DietLogSheet'
import PoopLogSheet from './PoopLogSheet'
import VomitLogSheet from './VomitLogSheet'

const POOP_LABEL: Record<string, string> = {
  normal: '正常', soft: '偏軟', loose: '拉稀', constipated: '便秘',
}
const POOP_COLOR: Record<string, string> = {
  normal: 'text-green-600', soft: 'text-yellow-600', loose: 'text-orange-600', constipated: 'text-slate-500',
}

type Sheet = 'vaccine' | 'diet' | 'poop' | 'vomit' | null

interface Props { petId: string }

export default function DailyTab({ petId }: Props) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const [logs, setLogs] = useState<PetDailyLog[]>([])
  const [vaccines, setVaccines] = useState<VaccineReminder[]>([])
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    api.getDailyLogs(petId, today).then(setLogs)
    api.getVaccineReminders(petId).then(setVaccines)
  }, [petId, today])

  const todayDiet  = logs.filter(l => l.type === 'diet')
  const todayPoop  = logs.filter(l => l.type === 'poop')
  const todayVomit = logs.filter(l => l.type === 'vomit')
  const overdueVax = vaccines.filter(v => v.nextDueDate && v.nextDueDate < today)
  const nextVax    = vaccines.filter(v => v.nextDueDate && v.nextDueDate >= today)
    .sort((a, b) => a.nextDueDate!.localeCompare(b.nextDueDate!))[0]

  const lastPoop = todayPoop.at(-1)?.data as PoopLogData | undefined
  const hasBloodVomit = todayVomit.some(l => (l.data as VomitLogData).content === 'blood')

  function addLog(log: PetDailyLog) { setLogs(prev => [log, ...prev]) }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">

        {/* 疫苗與驅蟲 */}
        <button onClick={() => setSheet('vaccine')}
          className="relative flex flex-col rounded-2xl border border-border-t bg-white p-4 text-left transition-colors hover:bg-primary-bg/30 active:scale-[.98]">
          {overdueVax.length > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-white">
              {overdueVax.length} 逾期
            </span>
          )}
          <div className="mb-2 flex items-center gap-2">
            <Syringe size={18} className="text-blue-500" />
            <span className="text-sm font-bold text-ink">疫苗驅蟲</span>
          </div>
          <p className="text-2xl font-black text-ink">{vaccines.length}</p>
          <p className="mt-0.5 text-xs text-slate-t">
            {nextVax ? `下次 ${nextVax.nextDueDate?.slice(5)}` : vaccines.length ? '無到期' : '尚無設定'}
          </p>
        </button>

        {/* 飲食 */}
        <button onClick={() => setSheet('diet')}
          className="flex flex-col rounded-2xl border border-border-t bg-white p-4 text-left transition-colors hover:bg-primary-bg/30 active:scale-[.98]">
          <div className="mb-2 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-primary" />
            <span className="text-sm font-bold text-ink">飲食</span>
          </div>
          <p className="text-2xl font-black text-ink">{todayDiet.length}</p>
          <p className="mt-0.5 text-xs text-slate-t">今日 {todayDiet.length} 筆</p>
          {todayDiet.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {todayDiet.map(l => (
                <span key={l.id} className="rounded-full bg-primary-bg px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {(l.data as DietLogData).mealTimeLabel}
                </span>
              ))}
            </div>
          )}
        </button>

        {/* 糞便 */}
        <button onClick={() => setSheet('poop')}
          className="flex flex-col rounded-2xl border border-border-t bg-white p-4 text-left transition-colors hover:bg-primary-bg/30 active:scale-[.98]">
          <div className="mb-2 flex items-center gap-2">
            <Droplets size={18} className="text-amber-500" />
            <span className="text-sm font-bold text-ink">糞便</span>
          </div>
          <p className={`text-2xl font-black ${todayPoop.length > 0 ? 'text-ink' : 'text-border-t'}`}>
            {todayPoop.length}
          </p>
          <p className={`mt-0.5 text-xs ${lastPoop ? POOP_COLOR[lastPoop.consistency] : 'text-slate-t'}`}>
            {lastPoop ? POOP_LABEL[lastPoop.consistency] : '今日未記錄'}
          </p>
        </button>

        {/* 嘔吐 */}
        <button onClick={() => setSheet('vomit')}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-colors active:scale-[.98] ${
            hasBloodVomit
              ? 'border-red-200 bg-red-50 hover:bg-red-100'
              : todayVomit.length > 0
                ? 'border-orange-200 bg-orange-50 hover:bg-orange-100'
                : 'border-border-t bg-white hover:bg-primary-bg/30'
          }`}>
          <div className="mb-2 flex items-center gap-2">
            <Wind size={18} className={hasBloodVomit || todayVomit.length > 0 ? 'text-orange-500' : 'text-slate-400'} />
            <span className="text-sm font-bold text-ink">嘔吐</span>
          </div>
          <p className={`text-2xl font-black ${todayVomit.length > 0 ? 'text-orange-500' : 'text-border-t'}`}>
            {todayVomit.length}
          </p>
          <p className={`mt-0.5 text-xs ${hasBloodVomit ? 'font-semibold text-error' : 'text-slate-t'}`}>
            {hasBloodVomit ? '含血 · 建議就診' : todayVomit.length > 0 ? '今日有記錄' : '今日未記錄'}
          </p>
        </button>

      </div>

      <VaccineSheet petId={petId} reminders={vaccines} open={sheet === 'vaccine'}
        onOpenChange={o => setSheet(o ? 'vaccine' : null)} onUpdate={setVaccines} />
      <DietLogSheet petId={petId} logs={logs} open={sheet === 'diet'}
        onOpenChange={o => setSheet(o ? 'diet' : null)} onAdded={addLog} />
      <PoopLogSheet petId={petId} logs={logs} open={sheet === 'poop'}
        onOpenChange={o => setSheet(o ? 'poop' : null)} onAdded={addLog} />
      <VomitLogSheet petId={petId} logs={logs} open={sheet === 'vomit'}
        onOpenChange={o => setSheet(o ? 'vomit' : null)} onAdded={addLog} />
    </div>
  )
}
