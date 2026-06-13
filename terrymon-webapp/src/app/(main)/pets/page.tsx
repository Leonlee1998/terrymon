import PetsClient from '@/components/pets/PetsClient'
import { api } from '@/services/api'
import EmptyState from '@/components/shared/EmptyState'

export const dynamic = 'force-dynamic'

export default async function PetsPage() {
  const pets = await api.getPets()
  const activePet = pets[0]
  if (!activePet) {
    return <EmptyState icon="🐾" title="目前沒有寵物資料" subtitle="新增寵物後就能查看醫療、美容與健康紀錄" />
  }

  const [medicalRecords, healthData, devices, groomingRecords] = activePet
    ? await Promise.all([
        api.getMedical(activePet.id),
        api.getHealthData(activePet.id),
        api.getDevices(activePet.id),
        api.getGroomingRecords(activePet.id),
      ])
    : [[], { petId: '', weight: [], bloodSugar: [], bloodPressureSys: [], bloodPressureDia: [], heartRate: [], temperature: [] }, [], []]

  return (
    <PetsClient
      pets={pets}
      activePet={activePet}
      medicalRecords={medicalRecords}
      healthData={healthData}
      devices={devices}
      groomingRecords={groomingRecords}
    />
  )
}
