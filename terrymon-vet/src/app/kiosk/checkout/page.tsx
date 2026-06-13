'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Receipt } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { useQueueStore } from '@/stores/queueStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

const COUNTDOWN_SECONDS = 15

export default function KioskCheckout() {
  const router = useRouter()
  const { member, selectedPet, queueNum, reset } = useKioskStore()
  const { done } = useQueueStore()
  const [verified, setVerified] = useState(false)
  const [verifyInput, setVerifyInput] = useState('')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  const completedItem = done.find(d => d.queueNum === queueNum)
  const consultation = completedItem?.consultation ?? {
    diagnosis: '急性腸胃炎',
    prescriptions: [
      { medicine: '美樂托寧', dosage: '10mg', frequency: '每天2次', days: 5 },
      { medicine: '益生菌', dosage: '1包', frequency: '每天1次', days: 14 },
    ],
    notes: '多補充水分，清淡飲食，5天後若未改善請回診。',
    fee: 800,
    followUpDate: '2026-06-22',
  }

  useEffect(() => {
    if (!verified) return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); reset(); router.replace('/kiosk'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [verified, reset, router])

  if (!member || !selectedPet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white">載入中...</p>
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="bg-primary px-6 py-5">
          <h1 className="text-white font-bold text-2xl">領取藥單</h1>
          <p className="text-white/70 mt-1">請再次確認身份</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          <div className="text-6xl">💊</div>
          <p className="text-xl font-bold text-ink text-center">
            {selectedPet.name} 的看診已完成
          </p>
          <p className="text-slate-t text-center">請輸入手機號碼確認身份</p>
          <Input
            value={verifyInput}
            onChange={e => setVerifyInput(e.target.value)}
            placeholder="0912-345-678"
            className="w-full max-w-xs h-12 text-center"
          />
          <Button
            onClick={() => { if (verifyInput.trim()) setVerified(true) }}
            disabled={!verifyInput.trim()}
            className="w-full max-w-xs bg-primary hover:bg-primary-hover text-white h-12 font-bold"
          >
            確認並領取 →
          </Button>
          <p className="text-xs text-slate-t">Demo：輸入任意號碼即可</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      <div className="bg-primary px-6 py-5">
        <h1 className="text-white font-bold text-2xl">看診完成</h1>
        <p className="text-white/70 mt-1">{selectedPet.name} · {queueNum}</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Diagnosis */}
        <div className="bg-primary-bg rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-t mb-1">診斷結果</p>
          <p className="font-bold text-ink text-lg">{consultation.diagnosis}</p>
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
          <div className="px-4 py-3 border-b border-border-t bg-surface">
            <p className="font-semibold text-ink text-sm">用藥清單</p>
          </div>
          {consultation.prescriptions.map((rx, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm border-b border-border-t last:border-0">
              <span className="font-medium col-span-1">{rx.medicine}</span>
              <span className="text-slate-t">{rx.dosage}</span>
              <span className="text-slate-t">{rx.frequency}</span>
              <span className="text-slate-t">{rx.days} 天</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-700 mb-1">醫師醫囑</p>
          <p className="text-sm text-amber-900">{consultation.notes}</p>
        </div>

        {/* Follow-up */}
        {consultation.followUpDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs font-bold text-blue-700">下次回診</p>
              <p className="text-sm font-semibold text-blue-900">{formatDate(consultation.followUpDate)}</p>
              <p className="text-xs text-blue-700">已加入您的預約行程</p>
            </div>
          </div>
        )}

        {/* Fee */}
        <div className="bg-white rounded-2xl border border-border-t p-4 flex items-center justify-between">
          <p className="font-semibold text-ink">本次費用</p>
          <p className="text-2xl font-black text-primary">NT$ {consultation.fee.toLocaleString()}</p>
        </div>

        {/* Document buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => toast.success('藥單已傳送至您的手機 App')}
            className="flex items-center justify-center gap-2 border-2 border-border-t rounded-xl py-3 text-sm font-medium text-ink hover:border-primary hover:text-primary transition-colors"
          >
            <FileText size={16} />
            查看藥單
          </button>
          <button
            onClick={() => toast.success('收據已傳送至您的手機 App')}
            className="flex items-center justify-center gap-2 border-2 border-border-t rounded-xl py-3 text-sm font-medium text-ink hover:border-primary hover:text-primary transition-colors"
          >
            <Receipt size={16} />
            查看收據
          </button>
        </div>

        {/* Countdown */}
        <div>
          <div className="flex justify-between text-xs text-slate-t mb-1.5">
            <span>{countdown} 秒後自動返回首頁</span>
          </div>
          <div className="h-1.5 bg-border-t rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
            />
          </div>
        </div>

        <Button
          onClick={() => { reset(); router.replace('/kiosk') }}
          variant="outline"
          className="w-full border-border-t"
        >
          立即返回首頁
        </Button>
      </div>
    </div>
  )
}
