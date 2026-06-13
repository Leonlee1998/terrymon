'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueueStore } from '@/stores/queueStore'
import PatientPanel from '@/components/doctor/PatientPanel'
import ConsultationForm from '@/components/doctor/ConsultationForm'

export default function DoctorConsultPage() {
  const router = useRouter()
  const inProgress = useQueueStore((s) => s.inProgress)

  useEffect(() => {
    if (!inProgress) router.replace('/doctor')
  }, [inProgress, router])

  if (!inProgress) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-screen overflow-hidden">
      <PatientPanel patient={inProgress} />
      <ConsultationForm />
    </div>
  )
}
