'use client'

import Link from 'next/link'
import { PawPrint, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Pet } from '@/types'
import PetFormDialog from './PetFormDialog'

export default function PetSelector({ pets, activePetId }: { pets: Pet[]; activePetId?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {pets.map(pet => {
          const active = pet.id === activePetId
          return (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className={`flex min-w-[86px] flex-col items-center gap-1 rounded-xl border px-2 py-2 transition-colors ${
                active
                  ? 'border-primary bg-primary-bg text-primary'
                  : 'border-border-t bg-white text-slate-t hover:border-primary hover:text-primary'
              }`}
            >
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-surface">
                {pet.photoUrl ? (
                  <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PawPrint size={22} />
                  </div>
                )}
              </div>
              <span className="max-w-[72px] truncate text-xs font-bold">{pet.name}</span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-[86px] flex-col items-center gap-1 rounded-xl border border-dashed border-border-t bg-white px-2 py-2 text-slate-t transition-colors hover:border-primary hover:text-primary"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
            <Plus size={22} />
          </div>
          <span className="text-xs font-bold">新增</span>
        </button>
      </div>

      <PetFormDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
