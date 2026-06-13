'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueueStore } from '@/stores/queueStore'
import PatientPanel from '@/components/doctor/PatientPanel'
import ConsultationForm from '@/components/doctor/ConsultationForm'

export default function ConsultPage() {
  const { inProgress } = useQueueStore()
  const router = useRouter()

  useEffect(() => {
    if (!inProgress) router.replace('/doctor')
  }, [inProgress, router])

  if (!inProgress) return null

  return (
    <div className="h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border-t overflow-hidden">
      <div className="overflow-y-auto">
        <PatientPanel patient={inProgress} />
      </div>
      <div className="overflow-y-auto flex flex-col">
        <ConsultationForm />
      </div>
    </div>
  )
}
