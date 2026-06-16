'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { AIoTDevice, GroomingRecord, MedicalRecord, Pet, PetHealthData } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PetSelector from './PetSelector'
import PetProfileCard from './PetProfileCard'
import MedicalTab from './MedicalTab'
import GroomingTab from './GroomingTab'
import HealthTab from './HealthTab'
import PetFormDialog from './PetFormDialog'
import PetOverviewTab from './PetOverviewTab'
import DailyTab from './DailyTab'

interface Props {
  pets: Pet[]
  activePet: Pet | null
  medicalRecords: MedicalRecord[]
  healthData: PetHealthData
  devices: AIoTDevice[]
  groomingRecords: GroomingRecord[]
}

export default function PetsClient({
  pets,
  activePet,
  medicalRecords,
  healthData,
  devices,
  groomingRecords,
}: Props) {
  const { member } = useAuthStore()
  const [addOpen, setAddOpen] = useState(false)
  const effectivePets = member?.pets ?? pets
  const effectiveActivePet = activePet
    ? member?.pets.find(p => p.id === activePet.id) ?? activePet
    : effectivePets[0] ?? null

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

  return (
    <div className="flex min-h-screen flex-col bg-surface/40">
      <div className="sticky top-0 z-20 border-b border-border-t bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-ink">我的寵物</h1>
              <p className="text-xs text-slate-t">健康、醫療、美容紀錄集中管理</p>
            </div>
            <Button onClick={() => setAddOpen(true)} size="sm" className="bg-primary text-white hover:bg-primary-hover">
              <Plus size={16} />
              新增
            </Button>
          </div>
          <PetSelector pets={effectivePets} activePetId={effectiveActivePet.id} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4">
        <PetProfileCard pet={effectiveActivePet} />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-5 rounded-xl bg-white p-1">
            <TabsTrigger value="overview" className="text-xs">總覽</TabsTrigger>
            <TabsTrigger value="medical" className="text-xs">醫療</TabsTrigger>
            <TabsTrigger value="grooming" className="text-xs">美容</TabsTrigger>
            <TabsTrigger value="health" className="text-xs">健康</TabsTrigger>
            <TabsTrigger value="daily" className="text-xs">日常</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PetOverviewTab
              pet={effectiveActivePet}
              healthData={healthData}
              devices={devices}
              medicalRecords={medicalRecords}
              groomingRecords={groomingRecords}
            />
          </TabsContent>
          <TabsContent value="medical">
            <MedicalTab records={medicalRecords} />
          </TabsContent>
          <TabsContent value="grooming">
            <GroomingTab records={groomingRecords} petName={effectiveActivePet.name} />
          </TabsContent>
          <TabsContent value="health">
            <HealthTab healthData={healthData} devices={devices} pet={effectiveActivePet} />
          </TabsContent>
          <TabsContent value="daily">
            <DailyTab petId={effectiveActivePet.id} />
          </TabsContent>
        </Tabs>
      </main>

      <PetFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
