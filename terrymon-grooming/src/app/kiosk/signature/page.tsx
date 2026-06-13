'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { useKioskStore } from '@/stores/kioskStore'

export default function KioskSignature() {
  const router = useRouter()
  const { selectedMain, selectedAddons, totalPrice, setSignature } = useKioskStore()
  const [hasSignature, setHasSignature] = useState(false)
  const sigRef = useRef<SignatureCanvas>(null)

  useEffect(() => {
    if (!selectedMain) router.replace('/kiosk')
  }, [selectedMain, router])

  if (!selectedMain) return null

  const allServices = [selectedMain, ...selectedAddons]

  function handleClear() {
    sigRef.current?.clear()
    setHasSignature(false)
  }

  function handleConfirm() {
    const data = sigRef.current?.toDataURL()
    if (data) setSignature(data)
    router.push('/kiosk/complete')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary h-14 flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => router.back()} className="text-white/80 hover:text-white">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-white font-bold">請簽名確認合約</h1>
      </div>

      <div className="flex-1 p-4">
        {/* Service summary chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allServices.map(s => (
            <span key={s.id} className="text-xs bg-primary-bg text-primary rounded-full px-3 py-1 font-medium">
              {s.name}
            </span>
          ))}
          <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-3 py-1 font-bold">
            NT$ {totalPrice()}
          </span>
        </div>

        {/* Signature area */}
        <p className="text-sm font-semibold text-slate-600 mb-2">飼主簽名</p>
        <div className="relative border-2 border-border-t rounded-xl overflow-hidden">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{ height: 220, className: 'w-full' }}
            onEnd={() => setHasSignature(!(sigRef.current?.isEmpty() ?? true))}
          />
        </div>
        {/* Baseline */}
        <div className="border-t border-border-t mx-4 -mt-8 relative z-10" />

        {/* Actions */}
        <div className="flex gap-3 mt-10">
          <Button variant="outline" onClick={handleClear} className="flex-1 h-12">
            清除重簽
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasSignature}
            className="flex-1 h-12 font-semibold"
          >
            確認簽名
          </Button>
        </div>
      </div>
    </div>
  )
}
