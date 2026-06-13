'use client'
import { useState } from 'react'
import type { Appointment, Pet, AppointmentStatus } from '@/types'
import AppointmentCard from './AppointmentCard'
import AppointmentFAB from './AppointmentFAB'
import EmptyState from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'upcoming' | 'completed' | 'cancelled'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: '全部' },
  { key: 'upcoming',  label: '即將到來' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

interface Props { initialAppointments: Appointment[]; pets: Pet[] }

export default function AppointmentsClient({ initialAppointments, pets }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = appointments.filter(a => {
    if (filter === 'all')       return true
    if (filter === 'upcoming')  return a.status === 'confirmed' || a.status === 'pending'
    if (filter === 'completed') return a.status === 'completed'
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  })

  function handleCancel(id: string) {
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a)
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-border-t">
        <div className="px-4 pt-4 pb-0 max-w-2xl mx-auto w-full">
          <h1 className="font-bold text-lg text-ink mb-3">預約管理</h1>
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  filter === f.key
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border-t text-slate-t hover:border-primary'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📅"
            title="沒有預約紀錄"
            subtitle={filter === 'all' ? '點擊右下角按鈕新增預約' : '換個篩選條件試試看'}
          />
        ) : (
          <div className="space-y-3">
            {filtered
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(appt => {
                const pet = pets.find(p => p.id === appt.petId)
                return (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    pet={pet}
                    onCancel={handleCancel}
                  />
                )
              })}
          </div>
        )}
      </div>

      <AppointmentFAB />
    </div>
  )
}
