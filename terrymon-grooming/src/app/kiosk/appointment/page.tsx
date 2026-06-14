'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, CalendarDays, Clock, PawPrint } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { posApi } from '@/services/api'
import { Button } from '@/components/ui/button'

type ApptDetail = {
  id: string
  time: string
  petName: string
  petId: string
  notes: string
}

export default function KioskAppointment() {
  const router = useRouter()
  const { member, appointmentId, setTime } = useKioskStore()
  const [apptData, setApptData] = useState<ApptDetail | null>(null)

  useEffect(() => {
    if (!member) router.replace('/kiosk')
  }, [member, router])

  useEffect(() => {
    if (!appointmentId) return
    posApi.getAppointmentById(appointmentId).then(setApptData)
  }, [appointmentId])

  if (!member) return null

  function handleConfirm() {
    if (apptData) setTime(apptData.time)
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
        <div className="bg-primary-bg border-2 border-primary/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            <span className="font-bold text-primary">今日預約單</span>
            {apptData && (
              <span className="ml-auto text-xs text-slate-t bg-white rounded-full px-2 py-0.5">
                #{apptData.id.slice(0, 8).toUpperCase()}
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={13} className="text-slate-t" />
              <p className="text-xs text-slate-t">預約時間</p>
            </div>
            <p className="font-black text-ink text-2xl">
              {apptData ? apptData.time || '—' : '讀取中...'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <PawPrint size={13} className="text-slate-t" />
              <p className="text-xs text-slate-t">寵物</p>
            </div>
            <p className="font-bold text-ink">
              {apptData ? apptData.petName || '—' : '讀取中...'}
            </p>
          </div>

          {apptData?.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <p className="text-xs text-amber-700 font-medium">備註：{apptData.notes}</p>
            </div>
          )}
        </div>

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
