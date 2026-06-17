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

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pets = await api.getPets()
  const pet = pets.find(p => p.id === id) ?? await api.getPet(id).catch(() => null)

  const [medicalRecords, healthData, devices, groomingRecords] = pet
    ? await Promise.all([
        api.getMedical(id),
        api.getHealthData(id),
        api.getDevices(id),
        api.getGroomingRecords(id),
      ])
    : [[], emptyHealthData, [], []]

  return (
    <PetsClient
      pets={pets}
      activePet={pet}
      requestedPetId={id}
      medicalRecords={medicalRecords}
      healthData={healthData}
      devices={devices}
      groomingRecords={groomingRecords}
    />
  )
}
