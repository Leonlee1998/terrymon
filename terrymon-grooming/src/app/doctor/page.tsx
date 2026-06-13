'use client'
import { useEffect } from 'react'
import WaitingColumn from '@/components/doctor/WaitingColumn'
import InProgressColumn from '@/components/doctor/InProgressColumn'
import DoneColumn from '@/components/doctor/DoneColumn'
import { useQueueStore } from '@/stores/queueStore'

export default function DoctorQueue() {
  const loadQueue = useQueueStore(s => s.loadQueue)

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  return (
    <div className="flex-1 flex divide-x divide-border-t overflow-hidden">
      <WaitingColumn />
      <InProgressColumn />
      <DoneColumn />
    </div>
  )
}
