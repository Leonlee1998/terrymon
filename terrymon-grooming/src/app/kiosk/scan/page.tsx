'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, Gift, Loader2, ScanLine, Wallet } from 'lucide-react'
import { posApi } from '@/services/api'
import { useKioskStore } from '@/stores/kioskStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import type { Member } from '@/types'

type Phase = 'input' | 'loading' | 'confirm' | 'error'
type TodayAppt = { id: string; time: string; petName: string; petId: string; notes: string }

const TEST_PHONE = '0912345678'

export default function KioskScan() {
  const router = useRouter()
  const { setMember, setCheckinMode, setAppointmentId } = useKioskStore()
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('input')
  const [foundMember, setFoundMember] = useState<Member | null>(null)
  const [todayAppt, setTodayAppt] = useState<TodayAppt | null>(null)

  async function handleLookup(value = input) {
    const q = value.trim()
    if (!q) return

    setInput(q)
    setPhase('loading')
    setFoundMember(null)
    setTodayAppt(null)

    try {
      const member = await posApi.lookupMember(q)
      if (!member) {
        setPhase('error')
        return
      }

      setFoundMember(member)
      setTodayAppt(await posApi.getAppointmentToday(member.id))
      setPhase('confirm')
    } catch {
      setPhase('error')
    }
  }

  function handleConfirm(mode: 'walk_in' | 'has_appointment') {
    if (!foundMember) return

    setMember(foundMember)
    setCheckinMode(mode)
    setAppointmentId(mode === 'has_appointment' && todayAppt ? todayAppt.id : null)
    router.push(mode === 'has_appointment' && todayAppt ? '/kiosk/appointment' : '/kiosk/schedule')
  }

  if (phase === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-primary">
        <Loader2 size={42} className="text-white animate-spin" />
        <p className="text-white font-bold">正在查詢會員資料...</p>
      </div>
    )
  }

  if (phase === 'confirm' && foundMember) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-primary px-6 py-5 flex-shrink-0">
          <button onClick={() => setPhase('input')} className="text-white/75 hover:text-white mb-3">
            <ChevronLeft size={28} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black text-white">
              {foundMember.name[0]}
            </div>
            <div>
              <h1 className="text-white font-black text-2xl">{foundMember.name}</h1>
              <p className="text-white/75">{foundMember.phone}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet size={14} className="text-white/75" />
                <p className="text-white/75 text-xs">儲值金</p>
              </div>
              <p className="text-white font-black text-2xl">{formatPrice(foundMember.balance)}</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Gift size={14} className="text-white/75" />
                <p className="text-white/75 text-xs">會員點數</p>
              </div>
              <p className="text-white font-black text-2xl">{foundMember.points.toLocaleString()} 點</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {todayAppt ? (
            <div className="bg-primary-bg border border-primary/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={16} className="text-primary" />
                <p className="font-semibold text-primary">今日預約</p>
              </div>
              <p className="font-bold text-ink text-lg">{todayAppt.time || '未指定時間'}</p>
              <p className="text-slate-t text-sm">{todayAppt.petName || '寵物資料待確認'}</p>
              {todayAppt.notes && <p className="text-xs text-amber-700 mt-1">備註：{todayAppt.notes}</p>}
              <Button
                onClick={() => handleConfirm('has_appointment')}
                className="w-full mt-3 bg-primary hover:bg-primary-hover text-white font-bold"
              >
                預約報到
              </Button>
            </div>
          ) : (
            <div className="bg-surface border border-border-t rounded-2xl px-4 py-3 text-center">
              <p className="text-sm text-slate-t">目前沒有查到今日預約，可以使用現場報到測試完整流程。</p>
            </div>
          )}

          <div className="border-2 border-border-t rounded-2xl p-4">
            <p className="font-semibold text-ink mb-1">現場報到</p>
            <p className="text-sm text-slate-t mb-3">選擇美容師與時段後，再選寵物與服務。</p>
            <Button
              onClick={() => handleConfirm('walk_in')}
              variant="outline"
              className="w-full border-border-t font-semibold"
            >
              開始現場報到
            </Button>
          </div>

          <button
            onClick={() => handleConfirm('walk_in')}
            className="w-full flex items-center justify-between border border-border-t rounded-2xl px-4 py-3 hover:border-primary hover:bg-primary-bg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-primary" />
              <span className="font-medium text-ink">先略過儲值，繼續測試報到</span>
            </div>
            <span className="text-slate-t text-sm">{formatPrice(foundMember.balance)}</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5">
        <button onClick={() => router.back()} className="text-white/75 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">會員報到</h1>
        <p className="text-white/75 mt-1">掃描 QR Code，或輸入電話查詢會員。</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="relative w-64 h-64 border-4 border-dashed border-border-t rounded-2xl flex items-center justify-center bg-surface">
          {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
            <div key={pos} className={`absolute w-6 h-6 border-primary border-4 ${
              pos === 'tl' ? 'top-[-4px] left-[-4px] border-r-0 border-b-0 rounded-tl-xl' :
              pos === 'tr' ? 'top-[-4px] right-[-4px] border-l-0 border-b-0 rounded-tr-xl' :
              pos === 'bl' ? 'bottom-[-4px] left-[-4px] border-r-0 border-t-0 rounded-bl-xl' :
                             'bottom-[-4px] right-[-4px] border-l-0 border-t-0 rounded-br-xl'
            }`} />
          ))}
          <div className="flex flex-col items-center gap-3 text-slate-t">
            <ScanLine size={52} className="text-primary" />
            <p className="text-sm text-center">將 QR Code 放入框內</p>
          </div>
          <div className="absolute inset-4 overflow-hidden pointer-events-none">
            <div className="w-full h-0.5 bg-primary/60 animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-border-t" />
          <span className="text-slate-t text-sm">或手動輸入</span>
          <div className="flex-1 h-px bg-border-t" />
        </div>

        <div className="w-full max-w-xs space-y-3">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="test 或 0912345678"
            className="h-14 text-center text-xl font-bold tracking-widest"
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
          />
          {phase === 'error' && (
            <p className="text-red-500 text-sm text-center">查無會員，請使用 test 或 0912345678 測試。</p>
          )}
          <Button
            onClick={() => handleLookup()}
            disabled={!input.trim()}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
          >
            查詢會員
          </Button>
          <Button
            type="button"
            onClick={() => handleLookup(TEST_PHONE)}
            variant="outline"
            className="w-full h-12 border-border-t font-semibold"
          >
            使用測試會員
          </Button>
        </div>
      </div>
    </div>
  )
}
