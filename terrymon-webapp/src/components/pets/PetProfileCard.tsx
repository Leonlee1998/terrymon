'use client'

import { useState } from 'react'
import { Edit2, Eye, PawPrint } from 'lucide-react'
import type { Pet } from '@/types'
import PetFormDialog from './PetFormDialog'
import PetCardPreviewDialog from './PetCardPreviewDialog'

function calcAge(birthDate: string) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  if (totalMonths < 1) return '< 1 個月'
  if (totalMonths < 12) return `${totalMonths} 個月`
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return m > 0 ? `${y} 歲 ${m} 個月` : `${y} 歲`
}

function genderText(pet: Pet) {
  if (!pet.gender) return null
  const g = pet.gender === 'male' ? '♂' : '♀'
  const n = pet.isNeutered === true ? ' 已結紮' : pet.isNeutered === false ? ' 未結紮' : ''
  return `${g}${n}`
}

export default function PetProfileCard({ pet }: { pet: Pet }) {
  const [editOpen, setEditOpen]       = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const age    = calcAge(pet.birthDate)
  const gender = genderText(pet)
  const emoji  = pet.species === 'cat' ? '🐱' : '🐶'

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-white shadow-[0_0_25px_10px_rgba(74,170,181,0.1)]">
        <PawPrint
          size={70}
          className="pointer-events-none absolute -right-3 -top-3 rotate-[24deg] text-card-teal opacity-10"
          fill="currentColor"
          strokeWidth={0}
        />

        <div className="flex items-center gap-4 px-5 py-4">
          {/* 頭貼 56px */}
          <div className="relative h-14 w-14 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-card-teal" />
            {pet.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pet.photoUrl}
                alt={pet.name}
                className="h-full w-full rounded-full object-cover p-0.5"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card-teal-light p-0.5 text-2xl">
                {emoji}
              </div>
            )}
          </div>

          {/* 名字 + badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black tracking-wide text-card-teal leading-tight">{pet.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {pet.breed  && <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{pet.breed}</span>}
              {age        && <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{age}</span>}
              {pet.weight && <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{pet.weight} KG</span>}
            </div>
            {gender && <p className="text-xs text-gray-400 mt-0.5">{gender}</p>}
          </div>

          {/* ✏️ 👁️ */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:bg-card-teal-light hover:text-card-teal transition-colors"
              aria-label="編輯寵物資料"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setPreviewOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:bg-card-teal-light hover:text-card-teal transition-colors"
              aria-label="預覽寵物卡片"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </section>

      <PetFormDialog open={editOpen} onOpenChange={setEditOpen} pet={pet} />
      {previewOpen && <PetCardPreviewDialog pet={pet} onClose={() => setPreviewOpen(false)} />}
    </>
  )
}
