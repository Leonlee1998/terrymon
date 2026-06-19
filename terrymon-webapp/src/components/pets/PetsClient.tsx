'use client'

import { useState, useEffect } from 'react'
import { Edit2, Eye, Plus } from 'lucide-react'
import type { AIoTDevice, GroomingRecord, MedicalRecord, Pet, PetHealthData } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PetSelector from './PetSelector'
import PetFormDialog from './PetFormDialog'
import PetCardPreviewDialog from './PetCardPreviewDialog'
import MedicalTab from './MedicalTab'
import GroomingTab from './GroomingTab'
import HealthTab from './HealthTab'
import PetOverviewTab from './PetOverviewTab'
import DailyTab from './DailyTab'

function calcAge(birthDate: string) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  if (totalMonths < 1) return '< 1 個月'
  if (totalMonths < 12) return `${totalMonths} 個月`
  return `${Math.floor(totalMonths / 12)} 歲`
}

function genderText(pet: Pet) {
  if (!pet.gender) return null
  const g = pet.gender === 'male' ? '♂' : '♀'
  const n = pet.isNeutered === true ? ' 已結紮' : pet.isNeutered === false ? ' 未結紮' : ''
  return `${g}${n}`
}

interface Props {
  pets: Pet[]
  activePet: Pet | null
  requestedPetId?: string
  medicalRecords: MedicalRecord[]
  healthData: PetHealthData
  devices: AIoTDevice[]
  groomingRecords: GroomingRecord[]
}

export default function PetsClient({
  pets,
  activePet,
  requestedPetId,
  medicalRecords,
  healthData,
  devices,
  groomingRecords,
}: Props) {
  const { member, setActivePet } = useAuthStore()
  const [addOpen, setAddOpen]         = useState(false)
  const [editOpen, setEditOpen]       = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const effectivePets = member?.pets ?? pets
  const effectiveActivePet = (() => {
    if (activePet) return member?.pets.find(p => p.id === activePet.id) ?? activePet
    if (requestedPetId) return effectivePets.find(p => p.id === requestedPetId) ?? effectivePets[0] ?? null
    return effectivePets[0] ?? null
  })()

  useEffect(() => {
    if (effectiveActivePet) setActivePet(effectiveActivePet.id)
  }, [effectiveActivePet?.id])

  if (!effectiveActivePet) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-8">
        <div className="rounded-xl border border-border-t bg-white p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-bg text-primary">
            <Plus size={28} />
          </div>
          <h1 className="text-xl font-black text-ink">新增第一隻寵物</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-t">
            建立寵物資料後，就能查看健康趨勢、美容紀錄、醫療文件與照護提醒。
          </p>
          <Button onClick={() => setAddOpen(true)} className="mt-5 bg-primary text-white hover:bg-primary-hover">
            <Plus size={16} />
            新增寵物
          </Button>
        </div>
        <PetFormDialog open={addOpen} onOpenChange={setAddOpen} />
      </div>
    )
  }

  const pet    = effectiveActivePet
  const age    = calcAge(pet.birthDate)
  const gender = genderText(pet)
  const emoji  = pet.species === 'cat' ? '🐱' : '🐶'

  return (
    <Tabs defaultValue="overview" className="flex min-h-screen flex-col bg-surface/40">

      {/* ── Sticky merged header ── */}
      <div className="sticky top-0 z-20 border-b border-border-t bg-white/97 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl px-4">

          {/* Pet selector pills */}
          <div className="overflow-x-auto py-3 scrollbar-hide">
            <PetSelector pets={effectivePets} activePetId={pet.id} />
          </div>

          {/* Profile row */}
          <div className="flex items-center gap-3 pb-3">
            {/* Avatar */}
            <div className="relative h-12 w-12 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-card-teal" />
              {pet.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  className="h-full w-full rounded-full object-cover p-0.5"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-card-teal-light p-0.5 text-xl">
                  {emoji}
                </div>
              )}
            </div>

            {/* Name + badges */}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black leading-tight text-card-teal">{pet.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {pet.breed  && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{pet.breed}</span>}
                {age        && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{age}</span>}
                {pet.weight && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{pet.weight} KG</span>}
              </div>
              {gender && <p className="mt-0.5 text-[10px] text-gray-400">{gender}</p>}
            </div>

            {/* ✏️ 👁️ */}
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => setEditOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-t bg-surface text-slate-t transition-colors hover:border-card-teal hover:bg-card-teal-light hover:text-card-teal"
                aria-label="編輯寵物資料"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-card-teal bg-card-teal-light text-card-teal transition-colors hover:bg-card-teal hover:text-white"
                aria-label="預覽寵物卡片"
              >
                <Eye size={14} />
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="pb-2">
            <TabsList className="grid h-auto w-full grid-cols-5 rounded-xl bg-surface p-1">
              <TabsTrigger value="overview"  className="text-xs">總覽</TabsTrigger>
              <TabsTrigger value="medical"   className="text-xs">醫療</TabsTrigger>
              <TabsTrigger value="grooming"  className="text-xs">美容</TabsTrigger>
              <TabsTrigger value="health"    className="text-xs">健康</TabsTrigger>
              <TabsTrigger value="daily"     className="text-xs">日常</TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>

      {/* ── Tab 內容 ── */}
      <main className="mx-auto w-full max-w-3xl flex-1 p-4">
        <TabsContent value="overview" className="mt-0">
          <PetOverviewTab
            pet={pet}
            healthData={healthData}
            devices={devices}
            medicalRecords={medicalRecords}
            groomingRecords={groomingRecords}
          />
        </TabsContent>
        <TabsContent value="medical"  className="mt-0"><MedicalTab records={medicalRecords} /></TabsContent>
        <TabsContent value="grooming" className="mt-0"><GroomingTab records={groomingRecords} petName={pet.name} /></TabsContent>
        <TabsContent value="health"   className="mt-0"><HealthTab healthData={healthData} devices={devices} pet={pet} /></TabsContent>
        <TabsContent value="daily"    className="mt-0"><DailyTab petId={pet.id} species={pet.species} /></TabsContent>
      </main>

      <PetFormDialog open={editOpen} onOpenChange={setEditOpen} pet={pet} />
      {previewOpen && <PetCardPreviewDialog pet={pet} onClose={() => setPreviewOpen(false)} />}
    </Tabs>
  )
}
