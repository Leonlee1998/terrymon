'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import type { Pet } from '@/types'

const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐈', other: '🐾' }

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
    setTimeout(() => router.push('/kiosk/services'), 500)
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="pt-12 pb-6 px-6 text-center">
        <p className="text-white font-black text-2xl">請選擇今天的服務毛孩</p>
        <p className="text-white/60 text-sm mt-1">{member.name} 的毛孩</p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-3 px-6">
        {member.pets.map(pet => (
          <button
            key={pet.id}
            onClick={() => handleSelect(pet)}
            className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 transition-all
              ${selecting === pet.id ? 'scale-95 opacity-80' : 'hover:scale-[1.02]'}`}
          >
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center text-3xl shrink-0 overflow-hidden">
              {pet.photoUrl
                ? <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                : SPECIES_EMOJI[pet.species]
              }
            </div>

            {/* Info */}
            <div className="flex-1 text-left">
              <p className="font-bold text-lg text-ink">{pet.name}</p>
              <p className="text-sm text-slate-500">{pet.breed}・{pet.weight} kg</p>
            </div>

            {/* Right */}
            {pet.allergies.length > 0 ? (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-1 rounded-full shrink-0">
                ⚠️ 過敏
              </span>
            ) : (
              <ChevronRight size={20} className="text-slate-400 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
