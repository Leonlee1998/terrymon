'use client'
import { useEffect, useState } from 'react'
import { Clock, Plus, Minus } from 'lucide-react'
import { api } from '@/services/api'
import type { GroomingServiceItem } from '@/types'
import { useBookingStore } from '@/stores/bookingStore'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

export default function StepService() {
  const { store, mainService, addonServices, setMainService, toggleAddon } = useBookingStore()
  const [services, setServices] = useState<GroomingServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!store) return
    setLoading(true)
    api.getGroomingServices(store.id).then(s => { setServices(s); setLoading(false) })
  }, [store?.id])

  const mains  = services.filter(s => !s.isAddon)
  const addons = services.filter(s => s.isAddon)

  if (loading) return (
    <div className="space-y-3">
      {[0, 1, 2].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-ink mb-2">主要服務 *</p>
        <div className="space-y-2">
          {mains.map(svc => (
            <button
              key={svc.id}
              onClick={() => setMainService(svc)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                mainService?.id === svc.id
                  ? 'border-primary bg-primary-bg'
                  : 'border-border-t bg-white hover:border-primary/40'
              )}
            >
              <div className="flex-1">
                <p className="font-medium text-ink text-sm">{svc.name}</p>
                {svc.description && <p className="text-xs text-slate-t mt-0.5">{svc.description}</p>}
                <p className="text-xs text-slate-t flex items-center gap-1 mt-0.5">
                  <Clock size={11} />{svc.duration} 分鐘
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-ink text-sm">{formatPrice(svc.price)}</p>
              </div>
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex-shrink-0',
                mainService?.id === svc.id ? 'border-primary bg-primary' : 'border-border-t'
              )} />
            </button>
          ))}
        </div>
      </div>

      {addons.length > 0 && mainService && (
        <div>
          <p className="text-sm font-semibold text-ink mb-2">加購項目（選填）</p>
          <div className="space-y-2">
            {addons.map(svc => {
              const selected = addonServices.some(a => a.id === svc.id)
              return (
                <button
                  key={svc.id}
                  onClick={() => toggleAddon(svc)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    selected ? 'border-accent bg-accent-light' : 'border-border-t bg-white hover:border-accent/40'
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium text-ink text-sm">{svc.name}</p>
                    {svc.description && <p className="text-xs text-slate-t mt-0.5">{svc.description}</p>}
                  </div>
                  <p className="font-semibold text-sm flex-shrink-0 text-ink">+{formatPrice(svc.price)}</p>
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                    selected ? 'border-accent bg-accent text-white' : 'border-border-t'
                  )}>
                    {selected && <Minus size={12} />}
                    {!selected && <Plus size={12} className="text-slate-t" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
