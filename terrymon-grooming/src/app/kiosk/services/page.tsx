'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOCK_ADDON_SERVICES, MOCK_MAIN_SERVICES } from '@/lib/mock'
import { formatPrice } from '@/lib/utils'
import { useKioskStore } from '@/stores/kioskStore'
import type { KioskService } from '@/types'

export default function KioskServices() {
  const router = useRouter()
  const {
    selectedPet,
    selectedMain,
    selectedAddons,
    setMainService,
    toggleAddon,
    totalPrice,
    totalDuration,
  } = useKioskStore()

  useEffect(() => {
    if (!selectedPet) router.replace('/kiosk')
  }, [selectedPet, router])

  if (!selectedPet) return null

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#fff8ed]">
      <header className="flex-shrink-0 bg-primary px-5 pb-5 pt-4 text-white shadow-md shadow-primary/20">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 grid size-10 place-items-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25"
        >
          <ChevronLeft size={26} />
          <span className="sr-only">返回</span>
        </button>
        <p className="text-sm font-semibold text-white/75">服務選擇</p>
        <h1 className="mt-1 text-2xl font-black leading-tight">
          選擇 {selectedPet.name} 今天需要的美容項目
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
        <section className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Required</p>
              <h2 className="mt-1 text-lg font-black text-ink">主要服務</h2>
            </div>
            <p className="text-xs text-slate-t">請先選擇一項</p>
          </div>

          <div className="space-y-3">
            {MOCK_MAIN_SERVICES.filter(service => service.enabled).map(service => (
              <MainServiceCard
                key={service.id}
                service={service}
                selected={selectedMain?.id === service.id}
                onSelect={() => setMainService(service)}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-7 max-w-3xl pb-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Optional</p>
              <h2 className="mt-1 text-lg font-black text-ink">加購服務</h2>
            </div>
            <p className="text-xs text-slate-t">可複選</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MOCK_ADDON_SERVICES.filter(service => service.enabled).map(service => (
              <AddonServiceCard
                key={service.id}
                service={service}
                selected={selectedAddons.some(addon => addon.id === service.id)}
                onToggle={() => toggleAddon(service)}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="flex-shrink-0 border-t border-[#f1deca] bg-white/95 p-4 shadow-[0_-12px_30px_rgba(80,50,20,0.10)] backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-t">預估時間</p>
              <p className="font-bold text-ink">{totalDuration()} 分鐘</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-t">總金額</p>
              <p className="text-2xl font-black text-primary">{formatPrice(totalPrice())}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/kiosk/payment')}
            disabled={!selectedMain}
            className="h-14 w-full rounded-2xl text-lg font-black disabled:opacity-40"
          >
            {selectedMain ? '下一步：選擇付款方式 →' : '請先選擇主要服務'}
          </Button>
        </div>
      </footer>
    </div>
  )
}

function MainServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: KioskService
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[24px] border-2 p-4 text-left transition-all ${
        selected
          ? 'border-primary bg-primary-bg shadow-md shadow-primary/15'
          : 'border-[#f1deca] bg-white hover:border-primary/45'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 grid size-7 flex-shrink-0 place-items-center rounded-full border-2 transition-colors ${
            selected ? 'border-primary bg-primary' : 'border-[#f1deca] bg-white'
          }`}
        >
          {selected && <Check size={15} className="text-white" strokeWidth={3} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-black leading-tight text-ink">{service.name}</p>
              <p className="mt-1 text-sm leading-6 text-slate-t">{service.description}</p>
            </div>
            <p className="shrink-0 text-xl font-black text-primary sm:text-right">
              {formatPrice(service.price)}
            </p>
          </div>
          <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-t">
            約 {service.duration} 分鐘
          </p>
        </div>
      </div>
    </button>
  )
}

function AddonServiceCard({
  service,
  selected,
  onToggle,
}: {
  service: KioskService
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`min-h-32 rounded-[22px] border-2 p-4 text-left transition-all ${
        selected
          ? 'border-primary bg-primary-bg shadow-sm shadow-primary/10'
          : 'border-[#f1deca] bg-white hover:border-primary/45'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-base font-black leading-snug text-ink">{service.name}</p>
        <div
          className={`grid size-6 flex-shrink-0 place-items-center rounded-lg border-2 transition-colors ${
            selected ? 'border-primary bg-primary' : 'border-[#f1deca] bg-white'
          }`}
        >
          {selected && <Check size={13} className="text-white" strokeWidth={3} />}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-t">{service.description}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#fff4df] px-2.5 py-1 text-xs font-bold text-slate-t">
          +{service.duration} 分鐘
        </span>
        <span className="font-black text-primary">+{formatPrice(service.price)}</span>
      </div>
    </button>
  )
}
