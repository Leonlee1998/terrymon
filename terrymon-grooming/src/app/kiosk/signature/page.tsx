'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, RotateCcw, Loader2 } from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import { useKioskStore } from '@/stores/kioskStore'
import { useAdminStore } from '@/stores/adminStore'
import { posApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import {
  STORE_OWNER, STORE_TAX_ID,
  CONTRACT_CANCEL_PCT, CONTRACT_TERMINATE_PCT,
  CONTRACT_REFUND_PRE, CONTRACT_REFUND_POST, CONTRACT_COURT,
} from '@/lib/constants'
import type { ContractData } from '@/lib/contract/types'

type Phase = 'idle' | 'signing' | 'uploading' | 'generating' | 'submitting' | 'done'

const PHASE_LABEL: Record<Phase, string> = {
  idle:       '確認簽名 →',
  signing:    '處理簽名...',
  uploading:  '上傳簽名...',
  generating: '產生合約 PDF...',
  submitting: '送出紀錄...',
  done:       '完成',
}

export default function KioskSignature() {
  const router = useRouter()
  const sigRef = useRef<SignatureCanvas>(null)
  const [hasSignature, setHasSignature] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')

  const {
    member, selectedPet, selectedMain, selectedAddons,
    setSignature, setContractUrl, totalPrice, serviceNames,
    paymentMode, balanceToUse, cardAmount, appointmentId, selectedGroomer,
  } = useKioskStore()
  const { shopName, shopPhone, shopAddress } = useAdminStore()

  useEffect(() => {
    if (!selectedMain) router.replace('/kiosk')
  }, [selectedMain, router])

  if (!member || !selectedPet || !selectedMain) return null

  function handleClear() {
    sigRef.current?.clear()
    setHasSignature(false)
  }

  async function handleConfirm() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast.error('請先完成簽名')
      return
    }
    setPhase('signing')

    try {
      // 1. Get signature as base64 + upload via existing storage API
      const signatureDataUrl = sigRef.current.toDataURL('image/png')
      setSignature(signatureDataUrl)

      setPhase('uploading')
      const sigBlob = await fetch(signatureDataUrl).then(r => r.blob())
      const form = new FormData()
      form.append('signature', sigBlob, 'signature.png')
      const uploadRes = await fetch('/api/storage/upload', { method: 'POST', body: form })
      if (!uploadRes.ok) throw new Error('簽名上傳失敗')
      const { signatureUrl } = await uploadRes.json() as { signatureUrl: string; contractUrl: string | null }

      // 2. Build contract data
      const svcList = serviceNames()
      const contractData: ContractData = {
        memberName:    member!.name,
        memberId:      member!.id,
        memberPhone:   member!.phone,
        memberAddress: '',
        memberBirth:   '',
        memberLegal:   '',
        storeName:     shopName,
        storeOwner:    STORE_OWNER,
        storePhone:    shopPhone,
        storeAddress:  shopAddress,
        storeTaxId:    STORE_TAX_ID,
        groomerName:   selectedGroomer ?? '',
        signLocation:  shopName,
        petName:       selectedPet!.name,
        petBreed:      selectedPet!.breed,
        petWeight:     selectedPet!.weight,
        petAllergies:  selectedPet!.allergies,
        services: svcList.map((name, i) => ({
          name,
          price:  i === 0 ? (selectedMain?.price ?? 0) : (selectedAddons[i - 1]?.price ?? 0),
          qty:    1,
          period: '當日',
        })),
        totalPrice:    totalPrice(),
        paymentMethod: paymentMode === 'balance' ? '儲值餘額折抵'
                     : paymentMode === 'card'    ? '信用卡'
                     : `儲值折抵 NT$${balanceToUse.toLocaleString()} + 信用卡 NT$${cardAmount().toLocaleString()}`,
        balanceUsed:   balanceToUse,
        cardAmount:    cardAmount(),
        memberFee:     0,
        cancelPct:     CONTRACT_CANCEL_PCT,
        terminatePct:  CONTRACT_TERMINATE_PCT,
        refundDaysPre:  CONTRACT_REFUND_PRE,
        refundDaysPost: CONTRACT_REFUND_POST,
        court:          CONTRACT_COURT,
        specialNotes:  selectedPet!.notes,
        signatureUrl,
        signedAt:      new Date().toISOString(),
      }

      // 3. Generate contract PDF via API route
      setPhase('generating')
      const contractRes = await fetch('/api/contract', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(contractData),
      })
      const { success, url: contractUrl, error } = await contractRes.json() as { success: boolean; url: string; error?: string }
      if (!success) throw new Error(error ?? '合約 PDF 產生失敗')
      setContractUrl(contractUrl)

      // 4. Submit service record
      setPhase('submitting')
      await posApi.completeService({
        memberId:        member!.id,
        petId:           selectedPet!.id,
        mainServiceId:   selectedMain!.id,
        addonServiceIds: selectedAddons.map(a => a.id),
        totalPrice:      totalPrice(),
        balanceUsed:     balanceToUse,
        signatureUrl,
        contractUrl,
        appointmentId:   appointmentId ?? undefined,
        groomerId:       selectedGroomer ?? undefined,
      })

      setPhase('done')
      router.push('/kiosk/complete')
    } catch (err) {
      console.error(err)
      toast.error('處理失敗：' + (err as Error).message)
      setPhase('idle')
    }
  }

  const submitting = phase !== 'idle' && phase !== 'done'

  return (
    <div className="flex-1 flex flex-col bg-white">
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

        {submitting && (
          <p className="text-xs text-primary mt-3 animate-pulse">{PHASE_LABEL[phase]}</p>
        )}

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
