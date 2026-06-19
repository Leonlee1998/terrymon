'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle, Calendar, Clock, MapPin, User, Scissors } from 'lucide-react'
import { api } from '@/services/api'
import { useBookingStore } from '@/stores/bookingStore'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border-t last:border-0">
      <div className="text-primary mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-slate-t">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  )
}

export default function StepConfirm() {
  const router = useRouter()
  const store = useBookingStore(s => s)
  const [submitting, setSubmitting] = useState(false)

  const {
    petId, petName, store: groStore, mainService, addonServices,
    date, slot, notes, photoUrl, totalPrice, estimatedDuration, reset,
  } = store

  async function handleSubmit() {
    if (!petId || !groStore || !mainService || !date || !slot) return
    setSubmitting(true)
    try {
      const { id: apptId } = await api.createAppointment({
        petId,
        storeId: groStore.id,
        serviceId: mainService.id,
        addonIds: addonServices.map(a => a.id),
        date,
        time: slot.slotTime,
        groomerId: slot.groomerId,
        notes,
        photoUrl: photoUrl ?? undefined,
      })

      // 預約成功 → 自動發預約訊息到店家聊天室
      try {
        const supabase = createClient()
        const { error: msgError } = await supabase.rpc('send_appointment_message', {
          p_appointment_id: apptId,
          p_store_id:       groStore.id,
          p_store_type:     groStore.type || 'grooming',
          p_pet_name:       petName,
          p_service_name:   [mainService.name, ...addonServices.map(a => a.name)].join('、'),
          p_date:           date,
          p_time:           slot.slotTime.slice(0, 5),
        })
        if (msgError) console.error('[send_appointment_message]', msgError)
      } catch (msgErr) {
        console.error('[send_appointment_message catch]', msgErr)
      }

      reset()
      toast.success('預約已送出！訊息已發送至店家')
      router.push('/messages')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '預約送出失敗，請重試')
    } finally {
      setSubmitting(false)
    }
  }

  const deposit = Math.ceil(totalPrice() * 0.3)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border-t p-4">
        <p className="text-sm font-semibold text-ink mb-1">預約摘要</p>
        <Row icon={<User size={16} />}      label="寵物"   value={petName} />
        <Row icon={<MapPin size={16} />}    label="店家"   value={groStore?.name ?? ''} />
        <Row icon={<Scissors size={16} />}  label="服務"   value={[mainService?.name, ...addonServices.map(a => a.name)].join('、')} />
        <Row icon={<Calendar size={16} />}  label="日期"   value={date} />
        <Row icon={<Clock size={16} />}     label="時段"   value={`${slot?.slotTime?.slice(0,5)} / 美容師：${slot?.groomerName}`} />
        <Row icon={<Clock size={16} />}     label="預估時長" value={`${estimatedDuration()} 分鐘`} />
        {notes && <Row icon={<CheckCircle size={16} />} label="備注" value={notes} />}
      </div>

      <div className="bg-primary-bg rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-t">估算費用</span>
          <span className="font-semibold text-ink">{formatPrice(totalPrice())}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-t">預付訂金（30%）</span>
          <span className="font-semibold text-primary">{formatPrice(deposit)}</span>
        </div>
        <p className="text-xs text-slate-t pt-1">
          ＊ 訂金於報到時繳付。確認後如需取消，請在 24 小時前操作以免沒收訂金。
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary-hover text-white h-12 text-base rounded-2xl"
      >
        {submitting ? '送出中…' : '確認預約'}
      </Button>
    </div>
  )
}
