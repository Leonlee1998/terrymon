'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileDown, Wallet, CreditCard } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const COUNTDOWN_SECONDS = 15

export default function KioskComplete() {
  const router = useRouter()
  const { member, selectedPet, selectedMain, totalPrice, totalDuration, serviceNames, contractUrl, balanceToUse, cardAmount, reset } = useKioskStore()
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (!selectedMain) { router.replace('/kiosk'); return }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          reset()
          router.replace('/kiosk')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedMain, reset, router])

  if (!member || !selectedPet || !selectedMain) return null

  const names = serviceNames()
  const price = totalPrice()
  const duration = totalDuration()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-pop mb-6">
        <CheckCircle2 size={80} className="text-white" strokeWidth={1.5} />
      </div>

      <h1 className="text-white font-black text-4xl mb-2">服務確認完成！</h1>
      <p className="text-white/70 text-lg mb-8">感謝 {member.name} 的光臨 🐾</p>

      {/* Summary card */}
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mb-6 text-left shadow-xl">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-t">
          <img
            src={selectedPet.photoUrl}
            alt={selectedPet.name}
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <p className="font-black text-ink text-lg">{selectedPet.name}</p>
            <p className="text-slate-t text-sm">{selectedPet.breed}</p>
            <p className="text-slate-t text-xs">{member.name}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {names.map(name => (
            <div key={name} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <p className="text-ink text-sm">{name}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-t">預計時間</p>
              <p className="font-bold text-ink">約 {duration} 分鐘</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-t">服務費用</p>
              <p className="text-2xl font-black text-primary">{formatPrice(price)}</p>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="bg-surface rounded-2xl px-4 py-3 space-y-2">
            {balanceToUse > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Wallet size={13} className="text-primary" />
                  <span className="text-slate-t">儲值折抵</span>
                </div>
                <span className="font-semibold text-primary">-{formatPrice(balanceToUse)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <CreditCard size={13} className="text-slate-t" />
                <span className="text-slate-t">刷卡金額</span>
              </div>
              <span className="font-bold text-ink">{formatPrice(cardAmount())}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/20 rounded-2xl px-4 py-3 mb-4 text-sm text-white text-center">
        合約已傳送至 LINE 並儲存至雲端 📲
      </div>

      {contractUrl && (
        <a
          href={contractUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white text-primary font-bold rounded-2xl px-6 py-3 mb-4 text-sm shadow-md hover:bg-primary-bg transition-colors"
        >
          <FileDown size={18} />
          下載合約 PDF
        </a>
      )}

      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-white/60 text-xs mb-2">
          <span>{countdown} 秒後自動返回首頁</span>
          <span>{COUNTDOWN_SECONDS - countdown}/{COUNTDOWN_SECONDS}</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      <Button
        onClick={() => { reset(); router.replace('/kiosk') }}
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10 hover:text-white"
      >
        立即返回首頁
      </Button>
    </div>
  )
}
