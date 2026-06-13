'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKioskStore } from '@/stores/kioskStore'
import { fillContract } from '@/lib/contract'

export default function KioskContract() {
  const router = useRouter()
  const { member, selectedPet, selectedMain, selectedAddons, totalPrice } = useKioskStore()

  useEffect(() => {
    if (!selectedMain) router.replace('/kiosk')
  }, [selectedMain, router])

  if (!selectedMain || !member || !selectedPet) return null

  const allServices = [selectedMain, ...selectedAddons].map(s => s.name)
  const contractText = fillContract({
    memberName: member.name,
    memberPhone: member.phone,
    petName: selectedPet.name,
    petBreed: selectedPet.breed,
    petWeight: selectedPet.weight,
    services: allServices,
    totalPrice: totalPrice(),
  })

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary h-14 flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-white/80 hover:text-white">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-white font-bold">美容服務合約確認</h1>
      </div>

      {/* Contract content */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-120px)]">
        <div className="bg-white p-6">
          <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed">
            {contractText}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 border-t border-border-t bg-white">
        <Button
          onClick={() => router.push('/kiosk/signature')}
          className="w-full h-12 font-semibold"
        >
          內容正確，前往簽名 →
        </Button>
      </div>
    </div>
  )
}
