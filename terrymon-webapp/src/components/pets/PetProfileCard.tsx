'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AlertTriangle, ChevronRight, Edit2, Eye, PawPrint, Users } from 'lucide-react'
import type { Pet } from '@/types'
import PetFormDialog from './PetFormDialog'
import PetCardPreviewDialog from './PetCardPreviewDialog'
import CareInfoSheet from './CareInfoSheet'

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

export default function PetProfileCard({ pet }: { pet: Pet }) {
  const [editOpen, setEditOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [careOpen, setCareOpen] = useState(false)

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-white shadow-[0_0_25px_10px_rgba(74,170,181,0.1)]">
        {/* Decorative paw – top right */}
        <PawPrint
          size={90}
          className="pointer-events-none absolute -right-4 -top-4 rotate-[24deg] text-card-teal opacity-10"
          fill="currentColor"
          strokeWidth={0}
        />

        {/* ── Header ── */}
        <div className="flex items-start gap-5 p-6 pb-4">
          <div className="relative h-24 w-24 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-card-teal" />
            {pet.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pet.photoUrl} alt={pet.name} className="h-full w-full rounded-full object-cover p-0.5" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card-teal-light p-0.5">
                <PawPrint size={32} className="text-card-teal" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-2xl font-black tracking-wider text-card-teal">{pet.name}</h2>
            <p className="mt-2 text-[11px] font-medium tracking-widest text-gray-400">MONSTER ID</p>
            <p className="text-base font-bold tracking-wider text-card-teal">{shortMonsterId(pet.id)}</p>
            {pet.chipId && (
              <>
                <p className="mt-1.5 text-[11px] font-medium tracking-widest text-gray-400">MICROCHIP</p>
                <p className="text-sm font-bold tracking-wide text-ink">{pet.chipId}</p>
              </>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-1 pt-1">
            <button
              onClick={() => setEditOpen(true)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-card-teal-light hover:text-card-teal"
              aria-label="編輯寵物資料"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setPreviewOpen(true)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-card-teal-light hover:text-card-teal"
              aria-label="預覽卡片"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* ── Info grid ── */}
        <div className="mx-5 rounded-2xl border border-card-teal px-4 py-4">
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col gap-5 border-r border-border-t pr-4">
              <InfoItem label="生日 • BORN"   value={fmtBirth(pet.birthDate)} />
              <InfoItem label="性別 • SEX"     value={genderText(pet)} />
              <InfoItem label="照顧者"          value={pet.caregiver || '—'} />
            </div>
            <div className="flex flex-col gap-5 pl-1">
              <InfoItem label="體重 • WEIGHT"  value={pet.weight ? `${pet.weight} KG` : '—'} />
              <InfoItem label="品種 • BREED"   value={pet.breed || '—'} />
              <InfoItem label="血型 • BLOOD"   value={pet.bloodType || '—'} />
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        {pet.notes && (
          <div className="mx-5 mt-4 flex items-start gap-3 rounded-2xl border border-card-teal bg-card-teal-light px-4 py-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-[11px] font-medium tracking-wide text-red-500">注意事項 • NOTES</p>
              <p className="mt-1 text-sm font-bold text-gray-700">{pet.notes}</p>
            </div>
          </div>
        )}

        {/* ── Care info entry ── */}
        <button
          onClick={() => setCareOpen(true)}
          className="mx-5 mb-1 mt-4 flex w-[calc(100%-2.5rem)] items-center gap-2.5 rounded-2xl border border-card-teal px-4 py-3 transition-colors hover:bg-card-teal-light"
        >
          <Users size={15} className="shrink-0 text-card-teal" />
          <span className="flex-1 text-left text-sm font-semibold text-card-teal">照護資訊</span>
          <ChevronRight size={15} className="text-card-teal opacity-50" />
        </button>

        {/* ── Footer ── */}
        <div className="relative mt-4 flex items-end justify-end px-6 pb-6">
          <PawPrint
            size={90}
            className="pointer-events-none absolute bottom-4 left-4 -rotate-[25deg] text-card-teal opacity-10"
            fill="currentColor"
            strokeWidth={0}
          />
          <Image
            src="/assets/logo.png"
            alt="TerryMon 預約怪獸"
            width={108}
            height={36}
            className="relative z-10 object-contain"
          />
        </div>
      </section>

      <PetFormDialog open={editOpen} onOpenChange={setEditOpen} pet={pet} />
      {previewOpen && <PetCardPreviewDialog pet={pet} onClose={() => setPreviewOpen(false)} />}
      <CareInfoSheet pet={pet} open={careOpen} onOpenChange={setCareOpen} />
    </>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-card-teal">{label}</p>
      <p className="mt-0.5 text-[15px] font-bold text-gray-700">{value}</p>
    </div>
  )
}
