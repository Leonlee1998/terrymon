import { MOCK_DEVICES, MOCK_GROOMING_RECORDS, MOCK_HEALTH_DATA, MOCK_MEDICAL, MOCK_PETS } from '@/lib/mock'
import PetsClient from '@/components/pets/PetsClient'

export default function PetsPage() {
  const activePet = MOCK_PETS[0]
  const medicalRecords = MOCK_MEDICAL.filter(record => record.petId === activePet.id)
  const healthData = { ...MOCK_HEALTH_DATA, petId: activePet.id }
  const devices = MOCK_DEVICES.filter(device => device.petId === activePet.id)
  const groomingRecords = MOCK_GROOMING_RECORDS.filter(record => record.petId === activePet.id)

  return (
    <PetsClient
      pets={MOCK_PETS}
      activePet={activePet}
      medicalRecords={medicalRecords}
      healthData={healthData}
      devices={devices}
      groomingRecords={groomingRecords}
    />
  )
}
