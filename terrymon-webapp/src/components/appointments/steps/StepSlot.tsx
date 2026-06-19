'use client'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { api } from '@/services/api'
import type { AvailableSlot } from '@/types'
import { useBookingStore } from '@/stores/bookingStore'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function StepSlot() {
  const { store, mainService, date, slot, setDate, setSlot } = useBookingStore()
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!store || !mainService || !date) { setSlots([]); return }
    setLoading(true)
    api.getAvailableSlots(store.id, date, mainService.id).then(s => {
      setSlots(s)
      setLoading(false)
    })
  }, [store?.id, mainService?.id, date])

  const groomerGroups = slots.reduce<Record<string, AvailableSlot[]>>((acc, s) => {
    const key = s.groomerId
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-ink block mb-2">選擇日期</label>
        <Input
          type="date"
          min={today()}
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full"
        />
      </div>

      {date && (
        <div>
          <label className="text-sm font-semibold text-ink block mb-2">可用時段</label>
          {loading && (
            <div className="space-y-2">
              {[0, 1].map(i => <Skeleton key={i} className="h-10 rounded-xl" />)}
            </div>
          )}
          {!loading && slots.length === 0 && (
            <p className="text-slate-t text-sm text-center py-6 bg-surface rounded-xl">
              此日期無可用時段，請換個日期試試
            </p>
          )}
          {!loading && Object.entries(groomerGroups).map(([, grouperSlots]) => {
            const groomerName = grouperSlots[0].groomerName
            return (
              <div key={grouperSlots[0].groomerId} className="mb-4">
                <p className="text-xs text-slate-t flex items-center gap-1 mb-2">
                  <User size={12} />{groomerName}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {grouperSlots.map(s => (
                    <button
                      key={`${s.groomerId}-${s.slotTime}`}
                      onClick={() => setSlot(s)}
                      className={cn(
                        'py-2 rounded-xl text-sm font-medium border-2 transition-all',
                        slot?.groomerId === s.groomerId && slot?.slotTime === s.slotTime
                          ? 'border-primary bg-primary text-white'
                          : 'border-border-t bg-white hover:border-primary/40 text-ink'
                      )}
                    >
                      {s.slotTime.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
