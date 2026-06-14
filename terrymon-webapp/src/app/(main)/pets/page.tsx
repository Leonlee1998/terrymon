import PetsClient from '@/components/pets/PetsClient'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

const emptyHealthData = {
  petId: '',
  weight: [],
  bloodSugar: [],
  bloodPressureSys: [],
  bloodPressureDia: [],
  heartRate: [],
  temperature: [],
}

export default async function PetsPage() {
  const pets = await api.getPets()
  const activePet = pets[0] ?? null

  const [medicalRecords, healthData, devices, groomingRecords] = activePet
    ? await Promise.all([
        api.getMedical(activePet.id),
        api.getHealthData(activePet.id),
        api.getDevices(activePet.id),
        api.getGroomingRecords(activePet.id),
      ])
    : [[], emptyHealthData, [], []]

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
