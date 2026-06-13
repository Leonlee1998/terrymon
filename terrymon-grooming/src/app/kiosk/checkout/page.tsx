'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileText } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { Button } from '@/components/ui/button'

export default function KioskCheckout() {
  const router = useRouter()
  const { member, selectedPet, queueNum, reset } = useKioskStore()

  useEffect(() => {
    if (!member) router.replace('/kiosk')
  }, [member, router])

  if (!member || !selectedPet) return null

  function handleDone() {
    reset()
    router.replace('/kiosk')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 size={40} className="text-green-600" />
      </div>

      <h1 className="text-2xl font-black text-ink mb-2">看診完成！</h1>
      <p className="text-slate-t mb-8 text-center">請在櫃台領取藥單與收據</p>

      <div className="bg-primary-bg rounded-2xl p-6 w-full max-w-sm mb-8 text-center">
        <p className="text-sm text-slate-t mb-1">取件號碼</p>
        <p className="text-5xl font-black text-primary">{queueNum}</p>
        <p className="text-sm text-slate-t mt-2">{selectedPet.name} · {member.name}</p>
      </div>

      <div className="flex items-center gap-2 text-slate-t text-sm mb-8">
        <FileText size={16} />
        <span>藥單已傳送至櫃台列印</span>
      </div>

      <Button
        onClick={handleDone}
        className="w-full max-w-sm h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
      >
        完成，返回首頁
      </Button>
    </div>
  )
}
