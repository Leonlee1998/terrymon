'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Pet } from '@/types'
import { Button } from '@/components/ui/button'
import PetFrontCard from './PetFrontCard'
import PetPreviewBackCard from './PetPreviewBackCard'
import CareInfoSheet from './CareInfoSheet'
import PetTransferDialog from './PetTransferDialog'

type Side = 'front' | 'back'

interface Props {
  pet: Pet
  onClose: () => void
  showOnboarding?: boolean
}

export default function PetCardPreviewDialog({ pet, onClose, showOnboarding }: Props) {
  const router = useRouter()
  const [side, setSide]                     = useState<Side>('front')
  const [careOpen, setCareOpen]             = useState(false)
  const [xferOpen, setXferOpen]             = useState(false)
  const [onboardDismissed, setOnboardDismissed] = useState(false)

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 px-6"
        onClick={onClose}
      >
        <div className="flex w-full flex-col items-center gap-3" onClick={e => e.stopPropagation()}>

          {/* Onboarding banner */}
          {showOnboarding && !onboardDismissed && (
            <div className="w-full max-w-[280px] rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-sm font-black text-white">🎉 {pet.name} 的毛孩卡建立好了！</p>
              <ul className="mt-2 space-y-1.5 text-xs text-white/85">
                <li>👥 點「<span className="font-bold text-white">照護資訊</span>」加入共同照護者與緊急聯絡人</li>
                <li>👁️ 回頁面後，右上角眼睛隨時可以看這張卡</li>
                <li>📤 之後可以把卡片送給獸醫或美容師</li>
              </ul>
              <button
                onClick={() => setOnboardDismissed(true)}
                className="mt-3 w-full rounded-xl bg-white/20 py-1.5 text-xs font-semibold text-white hover:bg-white/30"
              >
                知道了 ✓
              </button>
            </div>
          )}

          {/* Close */}
          <div className="flex w-full max-w-[280px] justify-end">
            <button onClick={onClose} className="rounded-full p-1 text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Side toggle */}
          <div className="flex rounded-full bg-white/15 p-0.5">
            <button
              onClick={() => setSide('front')}
              className={`rounded-full px-6 py-1.5 text-sm font-semibold transition-colors ${
                side === 'front' ? 'bg-white text-gray-800' : 'text-white/70 hover:text-white'
              }`}
            >
              正面
            </button>
            <button
              onClick={() => setSide('back')}
              className={`rounded-full px-6 py-1.5 text-sm font-semibold transition-colors ${
                side === 'back' ? 'bg-white text-gray-800' : 'text-white/70 hover:text-white'
              }`}
            >
              背面
            </button>
          </div>

          {/* Card */}
          <div
            className="w-full max-w-[280px] overflow-hidden rounded-3xl shadow-2xl"
            style={{ aspectRatio: '54 / 86' }}
          >
            {side === 'front'
              ? <PetFrontCard pet={pet} />
              : <PetPreviewBackCard pet={pet} />
            }
          </div>

          {/* Action buttons */}
          <div className="flex w-full max-w-[280px] flex-col gap-2.5">
            <Button
              className="w-full border border-card-teal bg-card-teal font-semibold text-white hover:bg-card-teal/90"
              onClick={() => setCareOpen(true)}
            >
              照護資訊
            </Button>
            <Button
              variant="outline"
              className="w-full border border-white/50 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white"
              onClick={() => setXferOpen(true)}
            >
              轉移照顧權
            </Button>
            <Button
              variant="outline"
              className="w-full border border-white/50 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white"
              onClick={() => toast.info('送出功能即將推出，敬請期待！')}
            >
              送出卡片
            </Button>
          </div>
        </div>
      </div>

      <CareInfoSheet pet={pet} open={careOpen} onOpenChange={setCareOpen} />

      <PetTransferDialog
        open={xferOpen}
        onOpenChange={setXferOpen}
        petId={pet.id}
        petName={pet.name}
        onSuccess={() => {
          setXferOpen(false)
          router.refresh()
        }}
      />
    </>
  )
}
