'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, RotateCcw, Loader2 } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import { useKioskStore } from '@/stores/kioskStore'
import { useAdminStore } from '@/stores/adminStore'
import { posApi } from '@/services/api'
import { fillContract } from '@/lib/mock'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import ContractDocument from '@/components/kiosk/ContractDocument'
import {
  generateContractPdf,
  uploadContractToStorage,
  saveContractToFirestore,
  notifyLineContract,
} from '@/lib/generate-contract'

type Phase = 'idle' | 'signing' | 'generating' | 'uploading' | 'done'

const PHASE_LABEL: Record<Phase, string> = {
  idle:       '確認簽名 →',
  signing:    '確認簽名 →',
  generating: '產生合約 PDF...',
  uploading:  '上傳並發送...',
  done:       '完成',
}

export default function KioskSignature() {
  const router = useRouter()
  const sigRef = useRef<SignatureCanvas>(null)
  const contractRef = useRef<HTMLDivElement>(null)
  const [hasSignature, setHasSignature] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [sigData, setSigData] = useState('')

  const {
    member, selectedPet, selectedMain, selectedAddons,
    setSignature, setContractUrl, totalPrice, serviceNames,
  } = useKioskStore()
  const { shopName, shopPhone, shopAddress } = useAdminStore()

  useEffect(() => {
    if (!selectedMain) router.replace('/kiosk')
  }, [selectedMain, router])

  if (!member || !selectedPet || !selectedMain) return null

  function handleClear() {
    sigRef.current?.clear()
    setHasSignature(false)
    setSigData('')
  }

  async function handleConfirm() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast.error('請先完成簽名')
      return
    }

    const capturedSig = sigRef.current.toDataURL('image/png')
    setSigData(capturedSig)
    setSignature(capturedSig)
    setPhase('signing')

    // Wait for ContractDocument to re-render with signature before capture
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150))))

    try {
      // 1. Generate PDF
      setPhase('generating')
      const pdfBlob = await generateContractPdf(contractRef)

      // 2. Upload to Firebase Storage
      setPhase('uploading')
      const documentId = `DOC_${Date.now()}`
      const contractUrl = await uploadContractToStorage(pdfBlob, documentId)
      setContractUrl(contractUrl)

      // 3. Save to Firestore
      await saveContractToFirestore({
        memberId:    member!.id,
        petId:       selectedPet!.id,
        services:    serviceNames(),
        totalPrice:  totalPrice(),
        contractUrl,
        documentId,
        createdAt:   new Date().toISOString(),
      })

      // 4. LINE Notify
      await notifyLineContract({
        memberName:  member!.name,
        petName:     selectedPet!.name,
        services:    serviceNames(),
        totalPrice:  totalPrice(),
        contractUrl,
      })

      // 5. Complete service record
      await posApi.completeService({
        memberId:         member!.id,
        petId:            selectedPet!.id,
        mainServiceId:    selectedMain!.id,
        addonServiceIds:  selectedAddons.map(a => a.id),
        totalPrice:       totalPrice(),
        signatureData:    capturedSig,
        contractHtml:     fillContract({
          memberName:   member!.name,
          memberPhone:  member!.phone,
          petName:      selectedPet!.name,
          petBreed:     selectedPet!.breed,
          petWeight:    selectedPet!.weight,
          petAllergies: selectedPet!.allergies,
          services:     serviceNames(),
          totalPrice:   totalPrice(),
        }),
      })

      setPhase('done')
      router.push('/kiosk/complete')
    } catch (err) {
      console.error(err)
      toast.error('處理失敗，請重試')
      setPhase('idle')
    }
  }

  const submitting = phase !== 'idle' && phase !== 'signing'

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Hidden contract document for PDF capture — left: -9999px keeps it off-screen but rendered */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', pointerEvents: 'none', zIndex: -1, width: '794px' }}>
        <ContractDocument
          ref={contractRef}
          memberName={member.name}
          memberPhone={member.phone}
          memberId={member.id}
          petName={selectedPet.name}
          petBreed={selectedPet.breed}
          petWeight={selectedPet.weight}
          petAllergies={selectedPet.allergies}
          services={[selectedMain, ...selectedAddons]}
          totalPrice={totalPrice()}
          shopName={shopName}
          shopPhone={shopPhone}
          shopAddress={shopAddress}
          signatureData={sigData}
        />
      </div>

      {/* Header */}
      <div className="bg-primary px-6 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">飼主電子簽名</h1>
        <p className="text-white/70 mt-1">請在下方空白處完成簽名</p>
      </div>

      {/* Service summary */}
      <div className="bg-surface border-b border-border-t px-6 py-3">
        <div className="flex flex-wrap gap-2">
          {serviceNames().map(name => (
            <span key={name} className="text-xs bg-primary-bg text-primary px-2.5 py-1 rounded-full font-medium">
              {name}
            </span>
          ))}
          <span className="text-xs bg-primary text-white px-2.5 py-1 rounded-full font-bold ml-auto">
            {formatPrice(totalPrice())}
          </span>
        </div>
      </div>

      {/* Signature area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-sm font-semibold text-slate-t mb-3 self-start">飼主簽名</p>

        <div className="w-full border-2 border-border-t rounded-2xl overflow-hidden bg-white shadow-inner relative">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              className: 'w-full',
              style: { height: '240px', cursor: 'crosshair' },
            }}
            penColor="#1A1D1A"
            minWidth={1.5}
            maxWidth={3}
            onEnd={() => setHasSignature(!sigRef.current?.isEmpty())}
          />
          <div className="absolute bottom-14 left-6 right-6 h-px bg-border-t" />
          {!hasSignature && (
            <p className="absolute bottom-4 left-0 right-0 text-center text-slate-t/50 text-sm pointer-events-none">
              請在此處簽名
            </p>
          )}
        </div>

        {/* Progress label */}
        {phase !== 'idle' && phase !== 'signing' && (
          <p className="text-xs text-primary mt-3 animate-pulse">{PHASE_LABEL[phase]}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 w-full mt-4">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={submitting}
            className="flex-1 h-12 border-border-t text-slate-t"
          >
            <RotateCcw size={16} className="mr-2" />
            清除重簽
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasSignature || submitting}
            className="flex-2 h-12 bg-primary hover:bg-primary-hover text-white font-bold px-8 disabled:opacity-40"
          >
            {submitting
              ? <><Loader2 size={18} className="animate-spin mr-2" />{PHASE_LABEL[phase]}</>
              : '確認簽名 →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
