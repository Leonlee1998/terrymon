'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Wallet, CreditCard, Check } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import type { PaymentMode } from '@/stores/kioskStore'

export default function KioskPayment() {
  const router = useRouter()
  const {
    member, selectedMain,
    paymentMode, balanceToUse,
    setPaymentMode, setBalanceToUse,
    totalPrice, cardAmount,
  } = useKioskStore()

  const [sliderValue, setSliderValue] = useState(0)

  useEffect(() => {
    if (!selectedMain) router.replace('/kiosk')
  }, [selectedMain, router])

  if (!member || !selectedMain) return null

  const total = totalPrice()
  const balance = member.balance
  const maxBalance = Math.min(balance, total)

  function handleModeChange(mode: PaymentMode) {
    setPaymentMode(mode)
    if (mode === 'card') {
      setBalanceToUse(0); setSliderValue(0)
    } else if (mode === 'balance') {
      setBalanceToUse(maxBalance); setSliderValue(maxBalance)
    } else {
      const half = Math.floor(maxBalance / 2)
      setBalanceToUse(half); setSliderValue(half)
    }
  }

  const MODE_OPTIONS: { mode: PaymentMode; icon: React.ReactNode; title: string; desc: string }[] = [
    {
      mode: 'card',
      icon: <CreditCard size={24} className="text-primary" />,
      title: '全額刷卡',
      desc: `NT$ ${total.toLocaleString()} 刷卡付款`,
    },
    {
      mode: 'balance',
      icon: <Wallet size={24} className="text-primary" />,
      title: '儲值折抵',
      desc: balance >= total
        ? `餘額足夠，全額折抵 ${formatPrice(total)}`
        : `餘額不足（現有 ${formatPrice(balance)}），差額需刷卡`,
    },
    {
      mode: 'mixed',
      icon: <span className="flex"><Wallet size={20} className="text-primary" /><CreditCard size={20} className="text-primary -ml-1" /></span>,
      title: '部分折抵 + 刷卡',
      desc: '自由調整儲值折抵金額',
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">付款方式</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-white/70">服務費用</p>
          <p className="text-white font-black text-3xl">{formatPrice(total)}</p>
        </div>
      </div>

      <div className="bg-primary-bg border-b border-border-t px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-primary" />
          <span className="text-sm text-slate-t">可用儲值餘額</span>
        </div>
        <span className="font-bold text-primary">{formatPrice(balance)}</span>
      </div>

      <div className="flex-1 p-6 space-y-3 overflow-y-auto">
        {MODE_OPTIONS.map(({ mode, icon, title, desc }) => {
          const isSelected = paymentMode === mode
          const isDisabled = mode === 'balance' && balance <= 0
          return (
            <button
              key={mode}
              onClick={() => !isDisabled && handleModeChange(mode)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                isSelected ? 'border-primary bg-primary-bg' :
                isDisabled ? 'border-border-t opacity-40 cursor-not-allowed' :
                'border-border-t hover:border-primary/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                {icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-ink">{title}</p>
                <p className="text-sm text-slate-t mt-0.5">{desc}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}

        {paymentMode === 'mixed' && (
          <div className="bg-surface rounded-2xl p-4 border border-border-t">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-ink">儲值折抵金額</span>
              <span className="text-sm font-bold text-primary">{formatPrice(sliderValue)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxBalance}
              step={100}
              value={sliderValue}
              onChange={e => {
                const v = parseInt(e.target.value)
                setSliderValue(v)
                setBalanceToUse(v)
              }}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-t mt-1">
              <span>NT$ 0</span>
              <span>{formatPrice(maxBalance)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border-t space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-t">儲值折抵</span>
                <span className="text-primary font-semibold">-{formatPrice(sliderValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-t">刷卡付款</span>
                <span className="font-bold text-ink">{formatPrice(total - sliderValue)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-border-t rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-t mb-3 uppercase tracking-wider">付款摘要</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-t">服務費用</span>
              <span>{formatPrice(total)}</span>
            </div>
            {balanceToUse > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-t">儲值折抵</span>
                <span className="text-primary">-{formatPrice(balanceToUse)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-border-t pt-2">
              <span>刷卡金額</span>
              <span className="text-xl text-ink">{formatPrice(cardAmount())}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border-t p-4 flex-shrink-0">
        <Button
          onClick={() => router.push('/kiosk/contract')}
          className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
        >
          確認付款方式，前往合約 →
        </Button>
        {cardAmount() > 0 && (
          <p className="text-xs text-slate-t text-center mt-2">
            服務完成後，請至櫃台刷卡 {formatPrice(cardAmount())}
          </p>
        )}
      </div>
    </div>
  )
}
