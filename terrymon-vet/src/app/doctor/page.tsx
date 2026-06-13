'use client'
import { useEffect } from 'react'
import WaitingColumn from '@/components/doctor/WaitingColumn'
import InProgressColumn from '@/components/doctor/InProgressColumn'
import DoneColumn from '@/components/doctor/DoneColumn'
import { useQueueStore } from '@/stores/queueStore'

export default function QueuePage() {
  const loadQueue = useQueueStore(s => s.loadQueue)

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  return (
    <div className="flex h-[calc(100vh-56px)] divide-x divide-border-t">
      <WaitingColumn />
      <InProgressColumn />
      <DoneColumn />
    </div>
  )
}
