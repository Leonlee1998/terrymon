'use client'
import { useEffect, useState } from 'react'
import { MapPin, Phone } from 'lucide-react'
import { api } from '@/services/api'
import type { GroomingStore } from '@/types'
import { useBookingStore } from '@/stores/bookingStore'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function StepStore() {
  const { store, setStore } = useBookingStore()
  const [stores, setStores] = useState<GroomingStore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getGroomingStores().then(s => { setStores(s); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="space-y-3">
      {[0, 1].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>
  )

  if (stores.length === 0) return (
    <p className="text-slate-t text-sm text-center py-8">目前沒有可預約的店家</p>
  )

  return (
    <div className="space-y-3">
      {stores.map(s => (
        <button
          key={s.id}
          onClick={() => setStore(s)}
          className={cn(
            'w-full p-4 rounded-2xl border-2 text-left transition-all',
            store?.id === s.id
              ? 'border-primary bg-primary-bg'
              : 'border-border-t bg-white hover:border-primary/40'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-ink">{s.name}</p>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5',
              store?.id === s.id ? 'border-primary bg-primary' : 'border-border-t'
            )} />
          </div>
          {s.address && (
            <p className="text-sm text-slate-t flex items-center gap-1 mt-1">
              <MapPin size={13} className="flex-shrink-0" />
              {s.address}
            </p>
          )}
          {s.phone && (
            <p className="text-sm text-slate-t flex items-center gap-1 mt-0.5">
              <Phone size={13} className="flex-shrink-0" />
              {s.phone}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}
