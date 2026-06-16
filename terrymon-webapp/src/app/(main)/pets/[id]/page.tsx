import { notFound } from 'next/navigation'
import PetsClient from '@/components/pets/PetsClient'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pets = await api.getPets()
  const pet = pets.find(p => p.id === id) ?? await api.getPet(id).catch(() => null)
  if (!pet) notFound()

  const [medicalRecords, healthData, devices, groomingRecords] = await Promise.all([
    api.getMedical(id),
    api.getHealthData(id),
    api.getDevices(id),
    api.getGroomingRecords(id),
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
