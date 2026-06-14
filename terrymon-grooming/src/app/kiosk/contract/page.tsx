'use client'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { useAdminStore } from '@/stores/adminStore'
import { generateContractHtml } from '@/lib/contract'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function KioskContract() {
  const router = useRouter()
  const { member, selectedPet, selectedMain, selectedAddons, totalPrice, serviceNames } = useKioskStore()
  const { shopName, shopPhone, shopAddress } = useAdminStore()

  useEffect(() => {
    if (!selectedMain) router.replace('/kiosk')
  }, [selectedMain, router])

  const contractHtml = useMemo(() => {
    if (!member || !selectedPet || !selectedMain) return ''
    return generateContractHtml({
      memberName:   member.name,
      memberPhone:  member.phone,
      memberId:     member.id,
      petName:      selectedPet.name,
      petBreed:     selectedPet.breed,
      petWeight:    selectedPet.weight,
      petAllergies: selectedPet.allergies,
      services:     [selectedMain, ...selectedAddons].map(s => ({ name: s.name, price: s.price })),
      totalPrice:   totalPrice(),
      shopName,
      shopPhone,
      shopAddress,
    })
  }, [member, selectedPet, selectedMain, selectedAddons, shopName, shopPhone, shopAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!member || !selectedPet || !selectedMain) return null

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">美容服務合約</h1>
        <p className="text-white/70 mt-1">請仔細閱讀後點選「同意並簽名」</p>
      </div>

      <div className="bg-primary-bg border-b border-border-t px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-t">服務項目</p>
          <p className="font-semibold text-ink text-sm">{serviceNames().join('、')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-t">費用</p>
          <p className="font-black text-primary text-xl">{formatPrice(totalPrice())}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div
          className="p-6"
          dangerouslySetInnerHTML={{ __html: contractHtml }}
        />
      </div>

      <div className="border-t border-border-t p-6 flex-shrink-0">
        <Button
          onClick={() => router.push('/kiosk/signature')}
          className="w-full h-14 font-bold text-lg"
        >
          我已閱讀並同意，前往簽名 →
        </Button>
      </div>
    </div>
  )
}
