'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Wallet, Gift, CalendarDays } from 'lucide-react'
import { posApi } from '@/services/api'
import { useKioskStore } from '@/stores/kioskStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import type { Member } from '@/types'

type Phase = 'input' | 'loading' | 'confirm' | 'error'

export default function KioskScan() {
  const router = useRouter()
  const { setMember, setCheckinMode } = useKioskStore()
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('input')
  const [foundMember, setFoundMember] = useState<Member | null>(null)

  async function handleLookup() {
    if (!input.trim()) return
    setPhase('loading')
    try {
      const member = await posApi.lookupMember(input)
      if (!member) { setPhase('error'); return }
      setFoundMember(member)
      setPhase('confirm')
    } catch {
      setPhase('error')
    }
  }

  function handleConfirm(mode: 'walk_in' | 'has_appointment') {
    if (!foundMember) return
    setMember(foundMember)
    setCheckinMode(mode)
    router.push(mode === 'has_appointment' ? '/kiosk/appointment' : '/kiosk/schedule')
  }

  if (phase === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-white animate-spin" />
        <p className="text-white font-medium">查詢會員資料中...</p>
      </div>
    )
  }

  if (phase === 'confirm' && foundMember) {
    const todayAppt = { id: 'APT001', time: '14:00', service: '洗澡＋剪毛', petName: '小怪獸' }

    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-primary px-6 py-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black text-white">
              {foundMember.name[0]}
            </div>
            <div>
              <h2 className="text-white font-black text-2xl">{foundMember.name}</h2>
              <p className="text-white/70">{foundMember.phone}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet size={14} className="text-white/70" />
                <p className="text-white/70 text-xs">儲值餘額</p>
              </div>
              <p className="text-white font-black text-2xl">{formatPrice(foundMember.balance)}</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Gift size={14} className="text-white/70" />
                <p className="text-white/70 text-xs">回饋點數</p>
              </div>
              <p className="text-white font-black text-2xl">{foundMember.points.toLocaleString()} 點</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="bg-primary-bg border border-primary/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={16} className="text-primary" />
              <p className="font-semibold text-primary">今日預約</p>
            </div>
            <p className="font-bold text-ink text-lg">{todayAppt.time} · {todayAppt.service}</p>
            <p className="text-slate-t text-sm">{todayAppt.petName}</p>
            <Button
              onClick={() => handleConfirm('has_appointment')}
              className="w-full mt-3 bg-primary hover:bg-primary-hover text-white font-bold"
            >
              確認此預約，開始報到 →
            </Button>
          </div>

          <div className="border-2 border-border-t rounded-2xl p-4">
            <p className="font-semibold text-ink mb-1">現場報到（無預約）</p>
            <p className="text-sm text-slate-t mb-3">現場選時段與美容師</p>
            <Button
              onClick={() => handleConfirm('walk_in')}
              variant="outline"
              className="w-full border-border-t font-semibold"
            >
              現場報到 →
            </Button>
          </div>

          <button
            onClick={() => { setMember(foundMember); router.push('/kiosk/topup') }}
            className="w-full flex items-center justify-between border border-border-t rounded-2xl px-4 py-3 hover:border-primary hover:bg-primary-bg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-primary" />
              <span className="font-medium text-ink">現場儲值</span>
            </div>
            <span className="text-slate-t text-sm">目前餘額 {formatPrice(foundMember.balance)} →</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">會員報到</h1>
        <p className="text-white/70 mt-1">掃描 QR Code 或輸入手機號碼</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="relative w-64 h-64 border-4 border-dashed border-border-t rounded-2xl flex items-center justify-center bg-surface">
          {(['tl','tr','bl','br'] as const).map(pos => (
            <div key={pos} className={`absolute w-6 h-6 border-primary border-4 ${
              pos==='tl' ? 'top-[-4px] left-[-4px] border-r-0 border-b-0 rounded-tl-xl':
              pos==='tr' ? 'top-[-4px] right-[-4px] border-l-0 border-b-0 rounded-tr-xl':
              pos==='bl' ? 'bottom-[-4px] left-[-4px] border-r-0 border-t-0 rounded-bl-xl':
                           'bottom-[-4px] right-[-4px] border-l-0 border-t-0 rounded-br-xl'
            }`} />
          ))}
          <div className="flex flex-col items-center gap-2 text-slate-t">
            <span className="text-5xl">📱</span>
            <p className="text-sm text-center">出示手機 QR Code</p>
          </div>
          <div className="absolute inset-4 overflow-hidden pointer-events-none">
            <div className="w-full h-0.5 bg-primary/60 animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-border-t" />
          <span className="text-slate-t text-sm">或輸入手機號碼</span>
          <div className="flex-1 h-px bg-border-t" />
        </div>

        <div className="w-full max-w-xs space-y-3">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="0912-345-678"
            className="h-14 text-center text-xl font-bold tracking-widest"
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
          />
          {phase === 'error' && (
            <p className="text-red-500 text-sm text-center">找不到此會員，請確認後重試</p>
          )}
          <Button
            onClick={handleLookup}
            disabled={!input.trim()}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
          >
            查詢會員
          </Button>
        </div>
        <p className="text-xs text-slate-t">Demo：輸入任意內容即可</p>
      </div>
    </div>
  )
}
