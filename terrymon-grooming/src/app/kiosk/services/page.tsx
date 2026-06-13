'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKioskStore } from '@/stores/kioskStore'
import { MOCK_MAIN_SERVICES, MOCK_ADDON_SERVICES } from '@/lib/mock'

export default function KioskServices() {
  const router = useRouter()
  const { selectedPet, selectedMain, selectedAddons, setMainService, toggleAddon, totalPrice } = useKioskStore()

  useEffect(() => {
    if (!selectedPet) router.replace('/kiosk')
  }, [selectedPet, router])

  if (!selectedPet) return null

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary h-14 flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-white/80 hover:text-white">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-white font-bold">{selectedPet.name} 的美容服務</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Main services */}
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-500 mb-3">主要服務（必選一）</p>
          <div className="space-y-3">
            {MOCK_MAIN_SERVICES.map(svc => {
              const active = selectedMain?.id === svc.id
              return (
                <button
                  key={svc.id}
                  onClick={() => setMainService(svc)}
                  className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all
                    ${active ? 'border-primary bg-primary-bg' : 'border-border-t bg-white'}`}
                >
                  {active && (
                    <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                  <div className="flex items-start justify-between pr-8">
                    <div>
                      <p className="font-bold text-lg text-ink">{svc.name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{svc.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-xs text-slate-400 block">{svc.duration} 分鐘</span>
                      <span className="text-primary font-bold text-xl">NT$ {svc.price}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Addon services */}
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-500 mb-3">加值服務（可複選）</p>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_ADDON_SERVICES.map(svc => {
              const active = selectedAddons.some(a => a.id === svc.id)
              return (
                <button
                  key={svc.id}
                  onClick={() => toggleAddon(svc)}
                  className={`flex items-start gap-2 p-3 rounded-xl border transition-all text-left
                    ${active ? 'bg-primary-bg border-primary' : 'bg-white border-border-t'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center
                    ${active ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                    {active && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{svc.name}</p>
                    <p className="text-xs text-primary font-bold">+NT$ {svc.price}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-border-t p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">小計</p>
          <p className="text-primary font-bold text-xl">NT$ {totalPrice()}</p>
        </div>
        <Button
          onClick={() => router.push('/kiosk/contract')}
          disabled={!selectedMain}
          className="h-12 px-8"
        >
          下一步 →
        </Button>
      </div>
    </div>
  )
}
