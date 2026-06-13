'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, CheckCircle2, CreditCard } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

const TOPUP_PLANS = [
  { amount: 1000, bonus: 0,    label: '基本方案', popular: false },
  { amount: 3000, bonus: 300,  label: '銀卡方案', popular: false },
  { amount: 5000, bonus: 600,  label: '金卡方案', popular: true  },
  { amount: 8000, bonus: 1200, label: '頂級方案', popular: false },
]

type TopupPhase = 'select' | 'processing' | 'success'

export default function KioskTopup() {
  const router = useRouter()
  const { member, reset } = useKioskStore()
  const [selected, setSelected] = useState<typeof TOPUP_PLANS[0] | null>(null)
  const [phase, setPhase] = useState<TopupPhase>('select')

  if (!member) { router.replace('/kiosk'); return null }

  async function handleConfirm() {
    if (!selected) return
    setPhase('processing')
    await new Promise(r => setTimeout(r, 2000))
    setPhase('success')
    toast.success(`儲值成功！已存入 ${formatPrice(selected.amount + selected.bonus)}`)
  }

  if (phase === 'success' && selected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-pop mb-6">
          <CheckCircle2 size={80} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-white font-black text-4xl mb-2">儲值成功！</h1>
        <p className="text-white/70 text-lg mb-8">謝謝 {member.name}</p>
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl text-left">
          <p className="text-xs text-slate-t mb-1">本次儲值</p>
          <p className="text-3xl font-black text-primary mb-3">{formatPrice(selected.amount)}</p>
          {selected.bonus > 0 && (
            <div className="bg-accent-light rounded-xl px-4 py-2 mb-3">
              <p className="text-accent font-bold">🎁 贈送 {formatPrice(selected.bonus)}</p>
            </div>
          )}
          <div className="border-t border-border-t pt-3">
            <div className="flex justify-between">
              <span className="text-slate-t">儲值後餘額（估）</span>
              <span className="font-black text-ink text-xl">
                {formatPrice(member.balance + selected.amount + selected.bonus)}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => { reset(); router.replace('/kiosk') }}
          variant="outline"
          className="mt-6 border-white/30 text-white hover:bg-white/10 hover:text-white"
        >
          返回首頁
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">儲值</h1>
        <p className="text-white/70 mt-1">
          {member.name} · 目前餘額 {formatPrice(member.balance)}
        </p>
      </div>

      <div className="flex-1 p-6 space-y-3 overflow-y-auto">
        <p className="text-sm text-slate-t mb-2">選擇儲值方案</p>
        {TOPUP_PLANS.map(plan => (
          <button
            key={plan.amount}
            onClick={() => setSelected(plan)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all relative ${
              selected?.amount === plan.amount
                ? 'border-primary bg-primary-bg shadow-sm'
                : 'border-border-t hover:border-primary/50'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-4 bg-accent text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                最受歡迎
              </span>
            )}
            <div className="text-left">
              <p className="font-black text-ink text-xl">{formatPrice(plan.amount)}</p>
              <p className="text-xs text-slate-t">{plan.label}</p>
            </div>
            {plan.bonus > 0 ? (
              <div className="text-right">
                <p className="text-accent font-bold">+{formatPrice(plan.bonus)} 贈送</p>
                <p className="text-xs text-slate-t">實際獲得 {formatPrice(plan.amount + plan.bonus)}</p>
              </div>
            ) : (
              <p className="text-slate-t text-sm">無贈送</p>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="border-t border-border-t p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <p className="text-xs text-slate-t">儲值金額</p>
              <p className="font-bold text-ink">{formatPrice(selected.amount)}</p>
            </div>
            {selected.bonus > 0 && (
              <div className="text-right">
                <p className="text-xs text-slate-t">贈送</p>
                <p className="font-bold text-accent">+{formatPrice(selected.bonus)}</p>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-slate-t">刷卡金額</p>
              <p className="font-black text-primary text-xl">{formatPrice(selected.amount)}</p>
            </div>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={phase === 'processing'}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
          >
            {phase === 'processing' ? (
              <span className="flex items-center gap-2">
                <CreditCard size={20} className="animate-pulse" /> 請刷卡付款...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard size={20} /> 確認，前往刷卡 {formatPrice(selected.amount)}
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
