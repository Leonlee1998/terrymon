import { notFound } from 'next/navigation'
import PetsClient from '@/components/pets/PetsClient'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function PetDetailPage({ params }: { params: { id: string } }) {
  const pets = await api.getPets()
  const pet = pets.find(p => p.id === params.id) ?? await api.getPet(params.id).catch(() => null)
  if (!pet) notFound()

  const [medicalRecords, healthData, devices, groomingRecords] = await Promise.all([
    api.getMedical(params.id),
    api.getHealthData(params.id),
    api.getDevices(params.id),
    api.getGroomingRecords(params.id),
  ])

  return (
    <PetsClient
      pets={pets}
      activePet={pet}
      medicalRecords={medicalRecords}
      healthData={healthData}
      devices={devices}
      groomingRecords={groomingRecords}
    />
  )
}
