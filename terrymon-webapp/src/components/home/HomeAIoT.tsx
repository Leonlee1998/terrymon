'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import type { Pet, PetHealthData, AIoTDevice } from '@/types'
import AIoTDashboard from './AIoTDashboard'
import HealthAlerts from './HealthAlerts'

export default function HomeAIoT({ pets }: { pets: Pet[] }) {
  const { activePetId, member } = useAuthStore()
  const [healthData, setHealthData] = useState<PetHealthData | null>(null)
  const [devices, setDevices] = useState<AIoTDevice[]>([])

  const effectivePets = member?.pets?.length ? member.pets : pets
  const pet = effectivePets.find(p => p.id === activePetId) ?? effectivePets[0] ?? null

  useEffect(() => {
    if (!pet) return
    setHealthData(null)
    Promise.all([api.getHealthData(pet.id), api.getDevices(pet.id)]).then(
      ([hd, devs]) => {
        setHealthData(hd)
        setDevices(devs)
      }
    )
  }, [pet?.id])

  if (!pet || !healthData) return null

  return (
    <>
      <HealthAlerts pet={pet} healthData={healthData} />
      <AIoTDashboard pet={pet} devices={devices} healthData={healthData} />
    </>
  )
}
