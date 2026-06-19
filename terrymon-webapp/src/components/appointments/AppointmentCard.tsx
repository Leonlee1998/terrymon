'use client'
import { useState } from 'react'
import type { Appointment, Pet } from '@/types'
import { Clock, MapPin, ChevronDown, ChevronUp, User } from 'lucide-react'
import { formatDate, getSpeciesEmoji } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import { toast } from 'sonner'
import { api } from '@/services/api'

interface Props { appointment: Appointment; pet: Pet | undefined; onCancel: (id: string) => void }

const TOP_BAR: Record<string, string> = {
  checked_in: 'bg-blue-400',
  in_service: 'bg-purple-500',
}

const CARD_BORDER: Record<string, string> = {
  checked_in: 'border-blue-300',
  in_service: 'border-purple-300',
  cancelled:  'border-border-t opacity-60',
}

export default function AppointmentCard({ appointment, pet, onCancel }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const canCancel = appointment.status === 'confirmed' || appointment.status === 'pending'
  const isActive  = appointment.status === 'checked_in' || appointment.status === 'in_service'

  const border  = CARD_BORDER[appointment.status] ?? 'border-border-t'
  const topBar  = TOP_BAR[appointment.status]
    ?? (appointment.type === 'vet' ? 'bg-primary' : 'bg-accent')

  async function handleCancel() {
    if (!confirm(`確定要取消 ${pet?.name ?? ''} 的預約嗎？`)) return
    setCancelling(true)
    try {
      const result = await api.cancelAppointment(appointment.id)
      onCancel(appointment.id)
      if (result.depositForfeited && result.amount > 0) {
        toast.warning(`預約已取消，訂金 NT$${result.amount} 將不退還`)
      } else {
        toast.success('預約已取消')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '取消預約失敗，請稍後再試')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${border}`}>
      <div className={`h-1 ${topBar}`} />

      {appointment.status === 'in_service' && (
        <div className="bg-purple-50 border-b border-purple-100 px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-medium text-purple-700">✂️ 服務進行中，請在店內等候</span>
        </div>
      )}

      {appointment.status === 'checked_in' && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-medium text-blue-700">已到店報到，等待服務中</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isActive ? 'bg-purple-50' : appointment.type === 'vet' ? 'bg-primary-bg' : 'bg-accent-light'
          }`}>
            <span className="text-xl">{appointment.type === 'vet' ? '🏥' : '✂️'}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">
                  {appointment.mainServiceName ?? (appointment.type === 'vet' ? '獸醫回診' : '寵物美容')}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-t mt-0.5">
                  <Clock size={11} />
                  <span>{formatDate(appointment.scheduledDate)} {appointment.scheduledTime?.slice(0,5)}</span>
                </div>
                {appointment.storeName && (
                  <div className="flex items-center gap-1 text-xs text-slate-t mt-0.5">
                    <MapPin size={11} />
                    <span className="truncate">{appointment.storeName}</span>
                  </div>
                )}
                {appointment.groomerName && (
                  <div className="flex items-center gap-1 text-xs text-slate-t mt-0.5">
                    <User size={11} />
                    <span>{appointment.groomerName}</span>
                  </div>
                )}
              </div>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="flex items-center justify-between mt-2">
              {pet && (
                <span className="inline-flex items-center gap-1 text-xs border border-border-t rounded-full px-2 py-0.5">
                  {getSpeciesEmoji(pet.species)} {pet.name}
                </span>
              )}
              <button onClick={() => setExpanded(!expanded)} className="text-slate-t ml-auto">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border-t space-y-2">
            {appointment.estimatedPrice != null && (
              <p className="text-xs text-slate-t">💰 預估費用：NT${appointment.estimatedPrice}</p>
            )}
            {appointment.depositAmount != null && (
              <p className="text-xs text-slate-t">
                💳 訂金：NT${appointment.depositAmount}
                {appointment.depositPaidAt ? ' ✅ 已繳' : ' ⏳ 待繳'}
              </p>
            )}
            {appointment.notes && (
              <p className="text-xs text-slate-t bg-surface rounded-lg px-3 py-2">
                💬 {appointment.notes}
              </p>
            )}
            {appointment.cancelReason && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                ⚠️ {appointment.cancelReason}
              </p>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-2 border border-red-200 text-red-600 text-sm rounded-xl py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {cancelling ? '取消中…' : '取消預約'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
