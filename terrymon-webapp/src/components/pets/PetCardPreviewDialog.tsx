'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Pet } from '@/types'
import { Button } from '@/components/ui/button'
import PetFrontCard from './PetFrontCard'
import PetPreviewBackCard from './PetPreviewBackCard'

type Side = 'front' | 'back'

interface Props {
  pet: Pet
  onClose: () => void
}

export default function PetCardPreviewDialog({ pet, onClose }: Props) {
  const [side, setSide] = useState<Side>('front')

  return (
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

        {/* Side toggle – centred */}
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

        {/* Send button */}
        <Button
          className="w-full max-w-[280px] bg-card-teal font-semibold text-white hover:bg-card-teal/90"
          onClick={() => toast.info('送出功能即將推出，敬請期待！')}
        >
          送出卡片
        </Button>
      </div>
    </div>
  )
}
