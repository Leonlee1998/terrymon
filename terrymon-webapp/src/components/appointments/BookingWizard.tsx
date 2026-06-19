'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useBookingStore, BOOKING_STEPS, type BookingStep } from '@/stores/bookingStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import StepPet     from './steps/StepPet'
import StepStore   from './steps/StepStore'
import StepService from './steps/StepService'
import StepSlot    from './steps/StepSlot'
import StepDetails from './steps/StepDetails'
import StepConfirm from './steps/StepConfirm'

const STEP_META: Record<BookingStep, { title: string; subtitle: string }> = {
  pet:     { title: '選擇寵物',   subtitle: '此次預約要帶哪隻毛孩來？' },
  store:   { title: '選擇美容店', subtitle: '選擇您要前往的門市' },
  service: { title: '選擇服務',   subtitle: '選擇主要服務及加購項目' },
  slot:    { title: '選擇時段',   subtitle: '選擇預約日期與時間' },
  details: { title: '補充資訊',   subtitle: '備注與寵物照片（選填）' },
  confirm: { title: '確認預約',   subtitle: '確認以下資訊後送出' },
}

function StepDots() {
  const { step } = useBookingStore()
  const cur = BOOKING_STEPS.indexOf(step)
  return (
    <div className="flex gap-1.5 justify-center">
      {BOOKING_STEPS.map((s, i) => (
        <div
          key={s}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === cur ? 'w-6 bg-primary' : i < cur ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-border-t'
          )}
        />
      ))}
    </div>
  )
}

export default function BookingWizard() {
  const router = useRouter()
  const { step, nextStep, prevStep, isStepComplete, totalPrice, mainService } = useBookingStore()
  const cur = BOOKING_STEPS.indexOf(step)
  const isFirst   = cur === 0
  const isConfirm = step === 'confirm'
  const canNext   = isStepComplete(step)
  const meta = STEP_META[step]

  function handleBack() {
    if (isFirst) router.push('/appointments')
    else prevStep()
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-border-t">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-surface"
              aria-label="上一步"
            >
              <ChevronLeft size={22} className="text-ink" />
            </button>
            <div className="flex-1">
              <p className="font-bold text-ink">{meta.title}</p>
              <p className="text-xs text-slate-t">{meta.subtitle}</p>
            </div>
            <span className="text-xs text-slate-t">{cur + 1} / {BOOKING_STEPS.length}</span>
          </div>
          <StepDots />
        </div>
      </div>

      {/* 內容區：手機留 pb-44（bar 浮在 BottomNav 上），桌機留 pb-28 */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-44 md:pb-28">
        {step === 'pet'     && <StepPet />}
        {step === 'store'   && <StepStore />}
        {step === 'service' && <StepService />}
        {step === 'slot'    && <StepSlot />}
        {step === 'details' && <StepDetails />}
        {step === 'confirm' && <StepConfirm />}
      </div>

      {/* 底部操作列
          手機：bottom-20 浮在 BottomNav（~64px）上方；left-0 full width
          桌機：bottom-0；left-60 避開 sidebar（w-60 = 240px）                */}
      {!isConfirm && (
        <div className="fixed bottom-20 md:bottom-0 left-0 md:left-60 right-0 z-40 bg-white border-t border-border-t shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <div className="max-w-lg mx-auto px-4 py-3 grid grid-cols-3 items-center gap-2">

            {/* 上一步 */}
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-11 w-full rounded-2xl border-border-t text-slate-t hover:text-ink"
            >
              上一步
            </Button>

            {/* 預估費用（置中） */}
            <div className="text-center leading-tight">
              {mainService && (
                <>
                  <p className="text-[10px] text-slate-t">預估費用</p>
                  <p className="font-bold text-ink text-sm">{formatPrice(totalPrice())}</p>
                </>
              )}
            </div>

            {/* 下一步 */}
            <Button
              onClick={nextStep}
              disabled={!canNext}
              className={cn(
                'h-11 w-full rounded-2xl text-white',
                canNext
                  ? 'bg-primary hover:bg-primary-hover'
                  : 'bg-border-t text-slate-t cursor-not-allowed'
              )}
            >
              {step === 'details' ? '確認' : '下一步'}
            </Button>

          </div>
        </div>
      )}
    </div>
  )
}
