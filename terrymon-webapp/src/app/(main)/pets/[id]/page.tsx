import { MOCK_PETS, MOCK_MEDICAL, MOCK_HEALTH_DATA, MOCK_DEVICES, MOCK_GROOMING_RECORDS } from '@/lib/mock'
import { notFound } from 'next/navigation'
import PetsClient from '@/components/pets/PetsClient'

export default function PetDetailPage({ params }: { params: { id: string } }) {
  const pet = MOCK_PETS.find(p => p.id === params.id)
  if (!pet) notFound()

  const medicalRecords = MOCK_MEDICAL.filter(r => r.petId === params.id)
  const healthData = { ...MOCK_HEALTH_DATA, petId: params.id }
  const devices = MOCK_DEVICES.filter(d => d.petId === params.id)
  const groomingRecords = MOCK_GROOMING_RECORDS.filter(r => r.petId === params.id)

  return (
    <PetsClient
      pets={MOCK_PETS}
      activePet={pet}
      medicalRecords={medicalRecords}
      healthData={healthData}
      devices={devices}
      groomingRecords={groomingRecords}
    />
  )
}

export function generateStaticParams() {
  return MOCK_PETS.map(p => ({ id: p.id }))
}
