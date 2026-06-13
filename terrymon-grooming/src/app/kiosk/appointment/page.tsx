'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, CalendarDays, Clock, Scissors, PawPrint } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { MOCK_MAIN_SERVICES, MOCK_ADDON_SERVICES } from '@/lib/mock'
import { Button } from '@/components/ui/button'

// Mock 預約資料（後期從 Supabase 查）
const MOCK_APPOINTMENT = {
  id: 'APT001',
  time: '14:00',
  groomer: '小美',
  service: '洗澡＋剪毛',
  addons: ['香氛深層護毛'] as string[],
  petName: '小怪獸',
  duration: 90,
  note: '需特別注意耳朵清潔',
}

export default function KioskAppointment() {
  const router = useRouter()
  const { member, setGroomer, setTime, setMainService, toggleAddon } = useKioskStore()

  useEffect(() => {
    if (!member) router.replace('/kiosk')
  }, [member, router])

  if (!member) return null

  const appt = MOCK_APPOINTMENT

  function handleConfirm() {
    setGroomer(appt.groomer)
    setTime(appt.time)

    // Pre-populate services from appointment so contract page has data
    const allServices = [...MOCK_MAIN_SERVICES, ...MOCK_ADDON_SERVICES]
    const mainService = allServices.find(s => !s.isAddon && s.name === appt.service)
    if (mainService) setMainService(mainService)
    appt.addons?.forEach(addonName => {
      const addon = allServices.find(s => s.isAddon && s.name === addonName)
      if (addon) toggleAddon(addon)
    })

    router.push('/kiosk/pet')
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">確認預約</h1>
        <p className="text-white/70 mt-1">{member.name} 的今日預約</p>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {/* Appointment card */}
        <div className="bg-primary-bg border-2 border-primary/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            <span className="font-bold text-primary">今日預約單</span>
            <span className="ml-auto text-xs text-slate-t bg-white rounded-full px-2 py-0.5">#{appt.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-slate-t" />
                <p className="text-xs text-slate-t">預約時間</p>
              </div>
              <p className="font-black text-ink text-2xl">{appt.time}</p>
              <p className="text-xs text-slate-t mt-0.5">約 {appt.duration} 分鐘</p>
            </div>
            <div className="bg-white rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Scissors size={13} className="text-slate-t" />
                <p className="text-xs text-slate-t">負責美容師</p>
              </div>
              <p className="font-black text-ink text-xl">{appt.groomer}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <PawPrint size={13} className="text-slate-t" />
              <p className="text-xs text-slate-t">寵物 / 服務</p>
            </div>
            <p className="font-bold text-ink">{appt.petName}</p>
            <p className="text-slate-t text-sm">{appt.service}</p>
          </div>

          {appt.note && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <p className="text-xs text-amber-700 font-medium">備註：{appt.note}</p>
            </div>
          )}
        </div>

        {/* Cancel option */}
        <div className="border border-border-t rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">不是這個預約？</p>
            <p className="text-xs text-slate-t">可返回重新查詢，或選擇現場報到</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-t hover:text-primary underline underline-offset-2"
          >
            返回
          </button>
        </div>
      </div>

      <div className="border-t border-border-t p-4 flex-shrink-0">
        <Button
          onClick={handleConfirm}
          className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
        >
          確認，選擇寵物 →
        </Button>
      </div>
    </div>
  )
}
