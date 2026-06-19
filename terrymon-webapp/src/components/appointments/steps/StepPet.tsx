'use client'
import type { Pet } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { useBookingStore } from '@/stores/bookingStore'
import { cn } from '@/lib/utils'

export default function StepPet() {
  const { member } = useAuthStore()
  const { petId, setPet } = useBookingStore()

  const pets: Pet[] = member?.pets ?? []

  if (pets.length === 0) return (
    <p className="text-slate-t text-sm text-center py-8">
      尚未建立寵物資料，請先至「我的寵物」新增
    </p>
  )

  return (
    <div className="space-y-3">
      {pets.map(pet => (
        <button
          key={pet.id}
          onClick={() => setPet(pet.id, pet.name)}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
            petId === pet.id
              ? 'border-primary bg-primary-bg'
              : 'border-border-t bg-white hover:border-primary/40'
          )}
        >
          {pet.photoUrl ? (
            <img src={pet.photoUrl} alt={pet.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-bg flex items-center justify-center flex-shrink-0 text-2xl">
              {pet.species === 'dog' ? '🐶' : pet.species === 'cat' ? '🐱' : '🐾'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">{pet.name}</p>
            <p className="text-sm text-slate-t">{pet.breed}</p>
            {pet.allergies.length > 0 && (
              <p className="text-xs text-accent mt-0.5">⚠️ 過敏：{pet.allergies.join('、')}</p>
            )}
          </div>
          <div className={cn(
            'w-5 h-5 rounded-full border-2 flex-shrink-0',
            petId === pet.id ? 'border-primary bg-primary' : 'border-border-t'
          )} />
        </button>
      ))}
    </div>
  )
}
