'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { posApi } from '@/services/api'
import { useKioskStore } from '@/stores/kioskStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ScanPhase = 'idle' | 'loading' | 'success' | 'error'

export default function KioskScan() {
  const router = useRouter()
  const { setMember } = useKioskStore()
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<ScanPhase>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleConfirm() {
    if (!input.trim()) { toast.error('請輸入會員資料'); return }
    setPhase('loading')
    try {
      const member = await posApi.lookupMember(input)
      if (!member) { setPhase('error'); return }
      setPhase('success')
      setMember(member)
      await new Promise(r => setTimeout(r, 1200))
      router.push('/kiosk/pet')
    } catch {
      setPhase('error')
      toast.error('查詢失敗，請重試')
    }
  }

  if (phase === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl animate-pop mb-6">
          ✅
        </div>
        <p className="text-white font-bold text-2xl">驗證成功！</p>
        <p className="text-white/70 mt-2">正在載入會員資料...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white">
          <ChevronLeft size={28} />
        </button>
        <div>
          <h1 className="text-white font-bold text-xl">獸醫掛號</h1>
          <p className="text-white/70 text-sm">掃描 QR Code 或輸入手機號碼完成掛號</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        {/* QR scan frame */}
        <div className="relative w-64 h-64 border-4 border-dashed border-border-t rounded-2xl flex items-center justify-center bg-surface">
          {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
            <div key={pos} className={`absolute w-6 h-6 border-primary border-4 ${
              pos === 'tl' ? 'top-[-4px] left-[-4px] border-r-0 border-b-0 rounded-tl-lg' :
              pos === 'tr' ? 'top-[-4px] right-[-4px] border-l-0 border-b-0 rounded-tr-lg' :
              pos === 'bl' ? 'bottom-[-4px] left-[-4px] border-r-0 border-t-0 rounded-bl-lg' :
                             'bottom-[-4px] right-[-4px] border-l-0 border-t-0 rounded-br-lg'
            }`} />
          ))}
          <div className="flex flex-col items-center gap-2 text-slate-t">
            <span className="text-5xl">📱</span>
            <p className="text-sm text-center leading-tight">出示手機 QR Code<br />對準此框</p>
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
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="0912-345-678"
            className="h-14 text-center text-xl font-bold tracking-widest"
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            disabled={phase === 'loading'}
          />
          {phase === 'error' && (
            <p className="text-red-500 text-sm text-center">找不到此會員，請確認後重試</p>
          )}
          <Button
            onClick={handleConfirm}
            disabled={phase === 'loading' || !input.trim()}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
          >
            {phase === 'loading'
              ? <><Loader2 size={20} className="animate-spin mr-2" />查詢中...</>
              : '確認掛號'}
          </Button>
        </div>

        <p className="text-xs text-slate-t">Demo：輸入任意內容即可掛號</p>
      </div>
    </div>
  )
}
