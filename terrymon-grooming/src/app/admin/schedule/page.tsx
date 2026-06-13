'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { SHIFT_CONFIG, GROOMER_RANK_CONFIG } from '@/lib/mock'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { GroomerShift, ShiftType } from '@/types'

function getWeekDates(baseDate: Date): Date[] {
  const monday = new Date(baseDate)
  const day = monday.getDay()
  monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const DAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function AdminSchedule() {
  const { groomers, shifts, storeHours, setShift } = useAdminStore()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [editShift, setEditShift] = useState<{ groomerId: string; date: string } | null>(null)
  const weekDates = getWeekDates(currentWeek)

  function getShift(groomerId: string, date: Date): GroomerShift | undefined {
    const dateStr = date.toISOString().split('T')[0]
    return shifts.find(s => s.groomerId === groomerId && s.date === dateStr)
  }

  function handleSetShift(type: ShiftType, start?: string, end?: string) {
    if (!editShift) return
    setShift({ id: `SH_${Date.now()}`, groomerId: editShift.groomerId, date: editShift.date, shiftType: type, startTime: start, endTime: end })
    toast.success('班表已更新')
    setEditShift(null)
  }

  const activeGroomers = groomers.filter(g => g.isActive)

  return (
    <div className="p-6">
      <AdminPageHeader title="排班管理" subtitle="設定美容師班表與營業時間" />

      <Tabs defaultValue="schedule">
        <TabsList className="mb-6">
          <TabsTrigger value="schedule">週班表</TabsTrigger>
          <TabsTrigger value="groomers">美容師管理</TabsTrigger>
          <TabsTrigger value="hours">營業時間</TabsTrigger>
        </TabsList>

        {/* ── 週班表 ── */}
        <TabsContent value="schedule">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d) }}
              className="p-2 hover:bg-surface rounded-lg"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-ink">
              {weekDates[0].toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
              {' '}～{' '}
              {weekDates[6].toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d) }}
              className="p-2 hover:bg-surface rounded-lg"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary-bg"
            >
              回到本週
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-border-t overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-t w-32">美容師</th>
                  {weekDates.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString()
                    const h = storeHours.find(h => h.dayOfWeek === d.getDay())
                    return (
                      <th key={i} className={cn(
                        'px-3 py-3 text-center text-sm font-semibold min-w-[110px]',
                        isToday ? 'text-primary' : 'text-slate-t',
                        h && !h.isOpen && 'opacity-50'
                      )}>
                        <div>{DAYS[i === 6 ? 6 : i]}</div>
                        <div className="text-xs font-normal mt-0.5">{d.getMonth()+1}/{d.getDate()}</div>
                        {h && !h.isOpen && <div className="text-[10px] text-slate-t/60">公休</div>}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-t">
                {activeGroomers.map(groomer => {
                  const rankCfg = GROOMER_RANK_CONFIG[groomer.rank]
                  return (
                    <tr key={groomer.id} className="hover:bg-surface/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{rankCfg.icon}</span>
                          <div>
                            <p className="font-medium text-ink text-sm">{groomer.name}</p>
                            <p className="text-[11px]" style={{ color: rankCfg.color }}>{rankCfg.label}</p>
                          </div>
                        </div>
                      </td>
                      {weekDates.map((date, i) => {
                        const shift = getShift(groomer.id, date)
                        const cfg = SHIFT_CONFIG[shift?.shiftType ?? 'off']
                        const isOff = !shift || shift.shiftType === 'off'
                        return (
                          <td key={i} className="px-2 py-2">
                            <button
                              onClick={() => setEditShift({ groomerId: groomer.id, date: date.toISOString().split('T')[0] })}
                              className={cn(
                                'w-full rounded-xl py-2 px-3 text-center transition-all hover:shadow-sm',
                                isOff ? 'bg-surface text-slate-t/50 text-xs hover:bg-border-t/30' : cfg.color
                              )}
                            >
                              {isOff ? '— 休 —' : (
                                <div>
                                  <p className="text-xs font-semibold">{cfg.label}</p>
                                  {shift?.startTime && (
                                    <p className="text-[10px] mt-0.5 opacity-70">
                                      {shift.startTime}–{shift.endTime}
                                    </p>
                                  )}
                                </div>
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 mt-3 flex-wrap">
            {Object.entries(SHIFT_CONFIG).map(([key, cfg]) => (
              <div key={key} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${cfg.color}`}>
                <span className="font-medium">{cfg.label}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── 美容師管理 ── */}
        <TabsContent value="groomers">
          <GroomerManager />
        </TabsContent>

        {/* ── 營業時間 ── */}
        <TabsContent value="hours">
          <StoreHoursEditor />
        </TabsContent>
      </Tabs>

      {/* Shift edit dialog */}
      {editShift && (
        <Dialog open onOpenChange={() => setEditShift(null)}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>
                設定班次 — {groomers.find(g => g.id === editShift.groomerId)?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-2">
              {[
                { type: 'full' as ShiftType,      label: '全天（09:00–18:00）', start: '09:00', end: '18:00' },
                { type: 'morning' as ShiftType,   label: '上午（09:00–13:00）', start: '09:00', end: '13:00' },
                { type: 'afternoon' as ShiftType, label: '下午（14:00–18:00）', start: '14:00', end: '18:00' },
                { type: 'off' as ShiftType,       label: '休假', start: undefined, end: undefined },
              ].map(opt => (
                <button
                  key={opt.type}
                  onClick={() => handleSetShift(opt.type, opt.start, opt.end)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-colors border-transparent hover:border-current',
                    SHIFT_CONFIG[opt.type].color
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ── 美容師管理 ────────────────────────────────────────
function GroomerManager() {
  const { groomers, addGroomer, updateGroomer, toggleGroomer } = useAdminStore()
  const [editTarget, setEditTarget] = useState<typeof groomers[0] | null>(null)
  const [isNew, setIsNew] = useState(false)
  const { register, handleSubmit, reset } = useForm<{
    name: string; rank: 'director' | 'senior' | 'stylist'; maxDailySlots: string; specialties: string
  }>()

  function onSubmit(data: { name: string; rank: 'director' | 'senior' | 'stylist'; maxDailySlots: string; specialties: string }) {
    const specialties = data.specialties ? data.specialties.split('、').filter(Boolean) : []
    if (editTarget) {
      updateGroomer({ ...editTarget, ...data, specialties, maxDailySlots: parseInt(data.maxDailySlots) || 5 })
      toast.success('美容師資料已更新')
      setEditTarget(null)
    } else {
      addGroomer({
        id: `G${Date.now()}`, storeId: 'S001', isActive: true,
        name: data.name, rank: data.rank, specialties,
        maxDailySlots: parseInt(data.maxDailySlots) || 5,
        joinedAt: new Date().toISOString().split('T')[0],
      })
      toast.success('美容師已新增')
      setIsNew(false)
    }
    reset()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setIsNew(true); setEditTarget(null); reset() }} className="bg-primary text-white">
          <Plus size={16} className="mr-2" />
          新增美容師
        </Button>
      </div>

      {(isNew || editTarget) && (
        <div className="bg-primary-bg rounded-2xl p-5 border border-primary/20">
          <p className="font-semibold text-ink mb-4">{editTarget ? `編輯：${editTarget.name}` : '新增美容師'}</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink">姓名</label>
                <Input {...register('name')} defaultValue={editTarget?.name} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">階級</label>
                <select
                  {...register('rank')}
                  defaultValue={editTarget?.rank ?? 'stylist'}
                  className="w-full mt-1 h-10 rounded-lg border border-border-t bg-white text-sm px-2"
                >
                  <option value="director">👑 領域長</option>
                  <option value="senior">⭐ 首席美容師</option>
                  <option value="stylist">✂️ 美容師</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink">每日最大接客數</label>
                <Input
                  {...register('maxDailySlots')}
                  type="number"
                  defaultValue={editTarget?.maxDailySlots ?? 5}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">擅長（以「、」分隔）</label>
                <Input
                  {...register('specialties')}
                  defaultValue={editTarget?.specialties.join('、')}
                  className="mt-1"
                  placeholder="貴賓、長毛犬"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="bg-primary text-white flex-1">儲存</Button>
              <Button type="button" variant="outline" onClick={() => { setIsNew(false); setEditTarget(null) }}>取消</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-t divide-y divide-border-t">
        {groomers.map(g => {
          const rankCfg = GROOMER_RANK_CONFIG[g.rank]
          return (
            <div key={g.id} className="flex items-center gap-4 px-5 py-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: rankCfg.bg }}
              >
                {rankCfg.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ink">{g.name}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: rankCfg.color, background: rankCfg.bg }}>
                    {rankCfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-t mt-0.5">
                  每日上限 {g.maxDailySlots} 位
                  {g.specialties.length > 0 && ` · 擅長：${g.specialties.join('、')}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={g.isActive} onCheckedChange={() => toggleGroomer(g.id)} />
                <button
                  onClick={() => { setEditTarget(g); setIsNew(false); reset() }}
                  className="text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary-bg"
                >
                  編輯
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 營業時間 ─────────────────────────────────────────
function StoreHoursEditor() {
  const { storeHours, updateHours } = useAdminStore()
  const [hours, setHours] = useState(storeHours)
  const DAY_NAMES = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

  function updateHour(day: number, field: string, value: string | boolean) {
    setHours(prev => prev.map(h => h.dayOfWeek === day ? { ...h, [field]: value } : h))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="grid grid-cols-5 gap-3 px-5 py-3 bg-surface text-xs font-semibold text-slate-t uppercase">
          <span>星期</span><span>營業</span><span>開店時間</span><span>關店時間</span><span>最晚接單</span>
        </div>
        <div className="divide-y divide-border-t">
          {hours.map(h => (
            <div key={h.dayOfWeek} className={cn('grid grid-cols-5 gap-3 px-5 py-3 items-center', !h.isOpen && 'opacity-50')}>
              <p className="font-medium text-ink">{DAY_NAMES[h.dayOfWeek]}</p>
              <Switch checked={h.isOpen} onCheckedChange={v => updateHour(h.dayOfWeek, 'isOpen', v)} />
              <Input type="time" value={h.openTime}
                onChange={e => updateHour(h.dayOfWeek, 'openTime', e.target.value)}
                disabled={!h.isOpen} className="h-9 text-sm" />
              <Input type="time" value={h.closeTime}
                onChange={e => updateHour(h.dayOfWeek, 'closeTime', e.target.value)}
                disabled={!h.isOpen} className="h-9 text-sm" />
              <Input type="time" value={h.lastBookingTime}
                onChange={e => updateHour(h.dayOfWeek, 'lastBookingTime', e.target.value)}
                disabled={!h.isOpen} className="h-9 text-sm" />
            </div>
          ))}
        </div>
      </div>
      <Button
        onClick={() => { updateHours(hours); toast.success('營業時間已儲存') }}
        className="bg-primary text-white"
      >
        儲存營業時間
      </Button>
    </div>
  )
}
