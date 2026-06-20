'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Edit2, Eye, Plus } from 'lucide-react'
import type { AIoTDevice, GroomingRecord, MedicalRecord, Pet, PetHealthData } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  if (totalMonths < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    return `${days} 天`
  }
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
  const [onboardPet, setOnboardPet]   = useState<Pet | null>(null)

  const effectivePets = member?.pets ?? pets

  const initialIndex = (() => {
    if (activePet) {
      const i = effectivePets.findIndex(p => p.id === activePet.id)
      return i >= 0 ? i : 0
    }
    if (requestedPetId) {
      const i = effectivePets.findIndex(p => p.id === requestedPetId)
      return i >= 0 ? i : 0
    }
    return 0
  })()

  const [petIndex, setPetIndex] = useState(initialIndex)

  // keep index in bounds when pets list changes
  useEffect(() => {
    if (petIndex >= effectivePets.length) setPetIndex(Math.max(0, effectivePets.length - 1))
  }, [effectivePets.length])

  const isAddNew  = petIndex >= effectivePets.length
  const pet       = isAddNew ? null : (effectivePets[petIndex] ?? null)

  useEffect(() => {
    if (pet) setActivePet(pet.id)
  }, [pet?.id])

  // no pets at all
  if (effectivePets.length === 0) {
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

  const age    = pet ? calcAge(pet.birthDate) : null
  const gender = pet ? genderText(pet) : null
  const emoji  = pet?.species === 'cat' ? '🐱' : '🐶'
  const totalDots = effectivePets.length + 1  // pets + 新增

  return (
    <Tabs defaultValue="overview" className="flex min-h-screen flex-col bg-surface/40">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 border-b border-border-t bg-white/97 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl">

          {/* 標題列 */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h1 className="text-lg font-black text-ink">{member?.name ? `${member.name}的毛孩` : '我的毛孩'}</h1>
            {pet && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-t bg-surface text-slate-t transition-colors hover:border-primary hover:bg-primary-bg hover:text-primary"
                  aria-label="編輯寵物資料"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary bg-primary-bg text-primary transition-colors hover:bg-primary hover:text-white"
                  aria-label="查看寵物卡片"
                >
                  <Eye size={15} />
                </button>
              </div>
            )}
          </div>

          {/* 大頭置中 + 左右箭頭 */}
          <div className="flex items-center px-2 pb-3">

            {/* 左箭頭 */}
            <button
              onClick={() => setPetIndex(i => Math.max(0, i - 1))}
              disabled={petIndex === 0}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-300 transition-colors hover:text-gray-500 disabled:opacity-0"
            >
              <ChevronLeft size={26} />
            </button>

            {/* 中央內容 */}
            <div className="flex flex-1 flex-col items-center">
              {isAddNew ? (
                /* ── 新增狀態 ── */
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex h-[84px] w-[84px] items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-300 transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus size={32} />
                </button>
              ) : (
                /* ── 寵物頭像 ── */
                <div className="relative h-[84px] w-[84px] shrink-0">
                  <div className="absolute inset-0 rounded-full border-[3px] border-primary shadow-[0_4px_16px_rgba(242,140,0,0.25)]" />
                  {pet?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="h-full w-full rounded-full object-cover p-0.5"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-bg p-0.5 text-4xl">
                      {emoji}
                    </div>
                  )}
                </div>
              )}

              {/* 名字 + 資訊 */}
              {isAddNew ? (
                <div className="mt-3 text-center">
                  <p className="text-base font-bold text-gray-400">新增毛孩</p>
                  <p className="mt-1 text-xs text-gray-300">點擊加號開始建立</p>
                </div>
              ) : (
                <div className="mt-3 text-center">
                  <p className="text-2xl font-black text-ink leading-tight">{pet?.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {[pet?.breed, age].filter(Boolean).join('・') || '尚未設定'}
                  </p>
                </div>
              )}

              {/* 指示點 */}
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: effectivePets.length }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPetIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      petIndex === i ? 'w-5 bg-primary' : 'w-1.5 bg-gray-200'
                    }`}
                  />
                ))}
                {/* 新增點（虛線圓） */}
                <button
                  onClick={() => setPetIndex(effectivePets.length)}
                  className={`h-1.5 w-1.5 rounded-full border transition-all ${
                    isAddNew
                      ? 'border-primary bg-primary'
                      : 'border-dashed border-gray-300 bg-transparent'
                  }`}
                />
              </div>
            </div>

            {/* 右箭頭 */}
            <button
              onClick={() => setPetIndex(i => Math.min(totalDots - 1, i + 1))}
              disabled={petIndex >= totalDots - 1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-300 transition-colors hover:text-gray-500 disabled:opacity-0"
            >
              <ChevronRight size={26} />
            </button>
          </div>

          {/* Tab bar — 橘色底線樣式 */}
          {!isAddNew && (
            <div className="border-t border-gray-100">
              <TabsList className="flex h-auto w-full rounded-none bg-transparent p-0">
                {(['overview','medical','grooming','health','daily'] as const).map((val, i) => (
                  <TabsTrigger
                    key={val}
                    value={val}
                    className="flex-1 rounded-none border-b-2 border-transparent py-2.5 text-xs font-semibold text-gray-400 transition-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    {['總覽','醫療','美容','健康','日常'][i]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab 內容 ── */}
      {!isAddNew && pet && (
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
      )}

      {pet && <PetFormDialog open={editOpen} onOpenChange={setEditOpen} pet={pet} />}
      {previewOpen && pet && <PetCardPreviewDialog pet={pet} onClose={() => setPreviewOpen(false)} />}
      {onboardPet && (
        <PetCardPreviewDialog
          pet={onboardPet}
          onClose={() => setOnboardPet(null)}
          showOnboarding
        />
      )}
      <PetFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onNewPet={newPet => {
          setOnboardPet(newPet)
          const idx = effectivePets.findIndex(p => p.id === newPet.id)
          if (idx >= 0) setPetIndex(idx)
        }}
      />
    </Tabs>
  )
}
