'use client'
import { useState } from 'react'
import type { Appointment, Pet } from '@/types'
import { Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate, getSpeciesEmoji } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import { toast } from 'sonner'

interface Props { appointment: Appointment; pet: Pet | undefined; onCancel: (id: string) => void }

export default function AppointmentCard({ appointment, pet, onCancel }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const canCancel = appointment.status === 'confirmed' || appointment.status === 'pending'
  const isPast = new Date(appointment.date) < new Date()

  async function handleCancel() {
    if (!confirm(`確定要取消 ${pet?.name ?? ''} 的預約嗎？`)) return
    setCancelling(true)
    await new Promise(r => setTimeout(r, 500))
    onCancel(appointment.id)
    toast.success('預約已取消')
    setCancelling(false)
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${
      appointment.status === 'cancelled' ? 'border-border-t opacity-60' : 'border-border-t'
    }`}>
      {/* Color bar */}
      <div className={`h-1 ${appointment.type === 'vet' ? 'bg-primary' : 'bg-accent'}`} />

      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            appointment.type === 'vet' ? 'bg-primary-bg' : 'bg-accent-light'
          }`}>
            <span className="text-xl">{appointment.type === 'vet' ? '🏥' : '✂️'}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">
                  {appointment.type === 'vet' ? '獸醫回診' : '寵物美容'}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-t mt-0.5">
                  <Clock size={11} />
                  <span>{formatDate(appointment.date)} {appointment.time}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-t mt-0.5">
                  <MapPin size={11} />
                  <span className="truncate">{appointment.location}</span>
                </div>
              </div>
              <StatusBadge status={appointment.status} />
            </div>

            {/* Pet + expand toggle */}
            <div className="flex items-center justify-between mt-2">
              {pet && (
                <span className="inline-flex items-center gap-1 text-xs border border-border-t rounded-full px-2 py-0.5">
                  {getSpeciesEmoji(pet.species)} {pet.name}
                </span>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-slate-t ml-auto"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border-t space-y-2">
            {appointment.address && (
              <p className="text-xs text-slate-t">📍 {appointment.address}</p>
            )}
            {appointment.notes && (
              <p className="text-xs text-slate-t bg-surface rounded-lg px-3 py-2">
                💬 {appointment.notes}
              </p>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-2 border border-red-200 text-red-600 text-sm rounded-xl py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {cancelling ? '取消中...' : '取消預約'}
              </button>
            )}
            {appointment.type === 'vet' && !isPast && (
              <p className="text-xs text-slate-t text-center">
                如需更改時間，請直接聯繫診所
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
