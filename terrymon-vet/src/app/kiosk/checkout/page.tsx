'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKioskStore } from '@/stores/kioskStore'
import { MOCK_MEDICAL } from '@/lib/mock'

const RECORD = MOCK_MEDICAL[0]

export default function KioskCheckout() {
  const router = useRouter()
  const { selectedPet, reset } = useKioskStore()
  const [verified, setVerified] = useState(false)
  const [input, setInput] = useState('')
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!verified) return
    if (countdown <= 0) { reset(); router.replace('/kiosk'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [verified, countdown, reset, router])

  /* ── Verify screen ── */
  if (!verified) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-black text-ink mb-2">身份驗證</h1>
          <p className="text-sm text-slate-t mb-6">請輸入手機號碼或掃描 QR Code</p>
          <div className="flex gap-2">
            <Input
              placeholder="手機號碼"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.trim() && setVerified(true)}
              className="h-12"
            />
            <Button
              disabled={!input.trim()}
              onClick={() => setVerified(true)}
              className="h-12 px-5 shrink-0"
            >
              確認
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Checkout screen ── */
  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-8 gap-5 overflow-y-auto">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl text-green-500 mb-3">✅</div>
        <h1 className="text-2xl font-black text-ink">
          {selectedPet?.name ?? '毛孩'} 看診完成！
        </h1>
      </div>

      {/* Diagnosis card */}
      <div className="bg-primary-bg rounded-xl p-4 space-y-3">
        <p className="font-semibold text-ink">診斷：{RECORD.diagnosis}</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-t text-left">
              <th className="pb-1 font-medium">藥品</th>
              <th className="pb-1 font-medium">劑量</th>
              <th className="pb-1 font-medium">頻率</th>
              <th className="pb-1 font-medium">天數</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-t">
            {RECORD.prescription.map((p, i) => (
              <tr key={i} className="text-ink">
                <td className="py-1">{p.medicine}</td>
                <td className="py-1">{p.dosage}</td>
                <td className="py-1">{p.frequency}</td>
                <td className="py-1">{p.days} 天</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fee */}
      <div className="text-center">
        <p className="text-sm text-slate-t mb-1">本次費用</p>
        <p className="text-2xl font-bold text-accent">NT$ 800</p>
      </div>

      {/* Documents */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => toast.success('藥單已傳送至您的手機 App')}
        >
          📄 藥單
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => toast.success('收據已傳送至您的手機 App')}
        >
          🧾 收據
        </Button>
      </div>

      {/* Follow-up */}
      {RECORD.nextVisitDate && (
        <div className="bg-accent-light border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent">
          📅 下次回診：{RECORD.nextVisitDate}，已加入預約行程
        </div>
      )}

      {/* Countdown bar */}
      <div className="space-y-1">
        <div className="h-2 bg-border-t rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${(countdown / 10) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-t text-center">{countdown} 秒後自動返回首頁</p>
      </div>

      {/* Manual return */}
      <Button
        className="w-full bg-primary hover:bg-primary-hover text-white"
        onClick={() => { reset(); router.replace('/kiosk') }}
      >
        立即返回
      </Button>
    </div>
  )
}
