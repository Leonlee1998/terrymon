'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, AlertTriangle, ChevronRight } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { getSpeciesEmoji, calcAge } from '@/lib/utils'
import type { Pet } from '@/types'

export default function KioskPet() {
  const router = useRouter()
  const { member, selectedPet, setSelectedPet, checkinMode } = useKioskStore()
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    if (!member) { router.replace('/kiosk'); return }
    if (selectedPet) router.replace('/kiosk/services')
  }, [member, selectedPet, router])

  if (!member) return null

  async function handleSelect(pet: Pet) {
    setSelecting(pet.id)
    setSelectedPet(pet)
    await new Promise(r => setTimeout(r, 600))
    router.push(checkinMode === 'has_appointment' ? '/kiosk/contract' : '/kiosk/services')
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">
          {member.name}，請選擇今天要美容的毛孩
        </h1>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {member.pets.map(pet => {
          const isSelecting = selecting === pet.id
          return (
            <button
              key={pet.id}
              onClick={() => handleSelect(pet)}
              disabled={!!selecting}
              className={`w-full flex flex-col p-4 rounded-2xl border-2 text-left transition-all ${
                isSelecting
                  ? 'border-primary bg-primary-bg scale-[0.98]'
                  : 'border-border-t bg-white hover:border-primary/50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img src={pet.photoUrl} alt={pet.name}
                       className="w-20 h-20 rounded-2xl object-cover" />
                  <span className="absolute -bottom-1 -right-1 text-xl bg-white rounded-full p-0.5 shadow-sm">
                    {getSpeciesEmoji(pet.species)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-ink">{pet.name}</h3>
                    {isSelecting && <span className="text-primary text-sm animate-pulse">選取中...</span>}
                  </div>
                  <p className="text-slate-t">{pet.breed} · {calcAge(pet.birthDate)}</p>
                  <p className="text-slate-t text-sm">體重：{pet.weight} kg</p>
                </div>
                <ChevronRight size={24} className={isSelecting ? 'text-primary' : 'text-slate-t'} />
              </div>

              {pet.allergies.length > 0 && (
                <div className="flex items-center gap-2 mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-700">⚠️ 過敏史（請告知醫師）</p>
                    <p className="text-xs text-red-600">{pet.allergies.join('、')}</p>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
