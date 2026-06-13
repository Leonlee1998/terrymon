'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKioskStore } from '@/stores/kioskStore'
import { MOCK_MEMBER, MOCK_PETS } from '@/lib/mock'

export default function KioskScan() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const setMember = useKioskStore(s => s.setMember)

  function handleConfirm() {
    if (!input.trim()) return
    setLoading(true)
    setTimeout(() => {
      setMember({ ...MOCK_MEMBER, pets: MOCK_PETS })
      setLoading(false)
      setSuccess(true)
      setTimeout(() => router.push('/kiosk/pet'), 1500)
    }, 600)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-1"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <h1 className="text-xl font-black text-ink text-center mb-8">掃描會員 QR Code</h1>

        <div className="relative w-[280px] h-[280px] mx-auto mb-8 overflow-hidden">
          {[
            'top-0 left-0 border-t-4 border-l-4',
            'top-0 right-0 border-t-4 border-r-4',
            'bottom-0 left-0 border-b-4 border-l-4',
            'bottom-0 right-0 border-b-4 border-r-4',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 border-primary ${cls} rounded-sm`} />
          ))}
          <div className="absolute inset-x-0 h-0.5 bg-primary/70 shadow-[0_0_8px_2px_rgba(242,140,0,0.5)] animate-[scanline_1.5s_linear_infinite]" />
          <style>{`@keyframes scanline{0%{transform:translateY(0)}100%{transform:translateY(280px)}}`}</style>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20">📷</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-slate-400">或手動輸入</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="手機號碼"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            className="h-12"
          />
          <Button
            onClick={handleConfirm}
            disabled={!input.trim() || loading}
            className="h-12 px-5 shrink-0"
          >
            確認
          </Button>
        </div>
      </div>

      {success && (
        <div className="absolute inset-0 bg-green-600/90 flex flex-col items-center justify-center gap-4 z-50">
          <div className="text-6xl">✅</div>
          <p className="text-white text-2xl font-black">驗證成功！</p>
        </div>
      )}
    </div>
  )
}
