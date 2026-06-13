'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { MOCK_MEDICAL } from '@/lib/mock'
import type { Pet } from '@/types'

const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐈', other: '🐾' }

function lastVisit(petId: string): string | null {
  const records = MOCK_MEDICAL.filter(r => r.petId === petId).sort(
    (a, b) => b.date.localeCompare(a.date)
  )
  return records[0]?.date ?? null
}

export default function KioskPet() {
  const router = useRouter()
  const { member, setSelectedPet } = useKioskStore()
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    if (!member) router.replace('/kiosk')
  }, [member, router])

  if (!member) return null

  function handleSelect(pet: Pet) {
    setSelecting(pet.id)
    setSelectedPet(pet)
    setTimeout(() => router.push('/kiosk/weight'), 500)
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="pt-12 pb-6 px-6 text-center">
        <p className="text-white font-black text-2xl">請選擇今天就診的毛孩</p>
        <p className="text-white/60 text-sm mt-1">{member.name} 的毛孩</p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-3 px-6">
        {member.pets.map(pet => {
          const visit = lastVisit(pet.id)
          return (
            <button
              key={pet.id}
              onClick={() => handleSelect(pet)}
              className={`w-full bg-white rounded-2xl p-4 flex flex-col gap-2 transition-all text-left
                ${selecting === pet.id ? 'scale-95 opacity-80' : 'hover:scale-[1.02]'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                  {pet.photoUrl
                    ? <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                    : SPECIES_EMOJI[pet.species]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-ink">{pet.name}</p>
                  <p className="text-sm text-slate-500">{pet.breed}・{pet.weight} kg</p>
                  {visit && (
                    <p className="text-xs text-slate-t mt-0.5">上次就診：{visit}</p>
                  )}
                </div>
                <ChevronRight size={20} className="text-slate-400 shrink-0" />
              </div>

              {pet.allergies.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
                  ⚠️ 過敏史：{pet.allergies.join('、')}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
