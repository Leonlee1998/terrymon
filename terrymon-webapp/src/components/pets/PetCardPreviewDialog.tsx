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
}

export default function PetCardPreviewDialog({ pet, onClose }: Props) {
  const router = useRouter()
  const [side, setSide]           = useState<Side>('front')
  const [careOpen, setCareOpen]   = useState(false)
  const [xferOpen, setXferOpen]   = useState(false)

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 px-6"
        onClick={onClose}
      >
        <div className="flex w-full flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
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
              className="w-full bg-card-teal font-semibold text-white hover:bg-card-teal/90"
              onClick={() => setCareOpen(true)}
            >
              👥 照護資訊
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/25 bg-white/10 font-semibold text-white hover:bg-white/20 hover:text-white"
              onClick={() => setXferOpen(true)}
            >
              🔄 轉移照顧權
            </Button>
            <Button
              variant="ghost"
              className="w-full text-white/50 hover:bg-white/10 hover:text-white/70"
              onClick={() => toast.info('送出功能即將推出，敬請期待！')}
            >
              📤 送出卡片
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
