'use client'
import type { Pet, MedicalRecord, PetHealthData, AIoTDevice, GroomingRecord } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import PetSelector from './PetSelector'
import PetProfileCard from './PetProfileCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MedicalTab from './MedicalTab'
import GroomingTab from './GroomingTab'
import HealthTab from './HealthTab'

interface Props {
  pets: Pet[]
  activePet: Pet
  medicalRecords: MedicalRecord[]
  healthData: PetHealthData
  devices: AIoTDevice[]
  groomingRecords: GroomingRecord[]
}

export default function PetsClient({ pets, activePet, medicalRecords, healthData, devices, groomingRecords }: Props) {
  const { member } = useAuthStore()
  const effectivePets = member?.pets ?? pets
  const effectiveActivePet = member?.pets.find(p => p.id === activePet.id) ?? activePet

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-20 bg-white border-b border-border-t">
        <div className="px-4 pt-4 pb-0 max-w-2xl mx-auto w-full">
          <h1 className="font-bold text-lg text-ink mb-3">我的寵物</h1>
          <PetSelector pets={effectivePets} activePetId={effectiveActivePet.id} />
        </div>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <PetProfileCard pet={effectiveActivePet} />

        <Tabs defaultValue="medical">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="medical">醫療紀錄</TabsTrigger>
            <TabsTrigger value="grooming">美容紀錄</TabsTrigger>
            <TabsTrigger value="health">健康數據</TabsTrigger>
          </TabsList>
          <TabsContent value="medical" className="mt-4">
            <MedicalTab records={medicalRecords} />
          </TabsContent>
          <TabsContent value="grooming" className="mt-4">
            <GroomingTab records={groomingRecords} petName={activePet.name} />
          </TabsContent>
          <TabsContent value="health" className="mt-4">
            <HealthTab healthData={healthData} devices={devices} pet={activePet} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
