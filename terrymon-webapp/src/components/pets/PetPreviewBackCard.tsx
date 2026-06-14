'use client'

import Image from 'next/image'
import { AlertTriangle, PawPrint } from 'lucide-react'
import type { Pet } from '@/types'

function shortMonsterId(id: string) {
  const clean = id.replace(/-/g, '').toUpperCase()
  return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}`
}

function fmtBirth(date: string) {
  if (!date) return '—'
  const [y, m, d] = date.split('-')
  return `${y} - ${m} - ${d}`
}

function genderText(pet: Pet) {
  if (!pet.gender) return '—'
  const g = pet.gender === 'male' ? '公' : '母'
  const n = pet.isNeutered === true ? '已結紮' : pet.isNeutered === false ? '未結紮' : ''
  return n ? `${g} • ${n}` : g
}

export default function PetPreviewBackCard({ pet }: { pet: Pet }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white">
      {/* Paw – top right */}
      <PawPrint
        size={64}
        className="pointer-events-none absolute -right-3 -top-3 rotate-[24deg] text-card-teal opacity-10"
        fill="currentColor"
        strokeWidth={0}
      />

      {/* Header */}
      <div className="flex items-start gap-5 px-5 pb-3 pt-6">
        <div className="relative mt-1 h-[58px] w-[58px] shrink-0">
          <div className="absolute inset-0 rounded-full border-2 border-card-teal" />
          {pet.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pet.photoUrl} alt={pet.name} className="h-full w-full rounded-full object-cover p-0.5" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card-teal-light p-0.5">
              <PawPrint size={22} className="text-card-teal" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[22px] font-black leading-none tracking-wider text-card-teal">{pet.name}</p>
          <div className="mt-3">
            <p className="text-[9px] font-semibold tracking-[0.18em] text-gray-400">MONSTER ID</p>
            <p className="mt-1 text-xs font-bold tracking-wider text-card-teal">{shortMonsterId(pet.id)}</p>
          </div>
          {pet.chipId && (
            <div className="mt-2.5">
              <p className="text-[9px] font-semibold tracking-[0.18em] text-gray-400">MICROCHIP</p>
              <p className="mt-1 text-[11px] font-bold tracking-wide text-ink">{pet.chipId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="mx-4 rounded-xl border border-card-teal px-3 py-3">
        <div className="grid grid-cols-2 gap-x-3">
          <div className="flex flex-col gap-3 border-r border-border-t pr-3">
            <BackInfo label="生日 • BORN"  value={fmtBirth(pet.birthDate)} />
            <BackInfo label="性別 • SEX"    value={genderText(pet)} />
            <BackInfo label="照顧者"          value={pet.caregiver || '—'} />
          </div>
          <div className="flex flex-col gap-3 pl-1">
            <BackInfo label="體重 • WEIGHT"  value={pet.weight ? `${pet.weight} KG` : '—'} />
            <BackInfo label="品種 • BREED"   value={pet.breed || '—'} />
            <BackInfo label="血型 • BLOOD"   value={pet.bloodType || '—'} />
          </div>
        </div>
      </div>

      {/* Notes */}
      {pet.notes && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-card-teal bg-card-teal-light px-3 py-2">
          <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-[9px] font-medium tracking-wide text-red-500">注意事項 • NOTES</p>
            <p className="mt-0.5 text-[11px] font-bold text-gray-700">{pet.notes}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-end px-4 pb-4">
        <PawPrint
          size={64}
          className="pointer-events-none absolute bottom-3 left-3 -rotate-[25deg] text-card-teal opacity-10"
          fill="currentColor"
          strokeWidth={0}
        />
        <Image src="/assets/logo.png" alt="TerryMon 預約怪獸" width={80} height={27} className="relative z-10 object-contain" />
      </div>
    </div>
  )
}

function BackInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-medium tracking-wide text-card-teal">{label}</p>
      <p className="mt-0.5 text-[11px] font-bold text-gray-700">{value}</p>
    </div>
  )
}
