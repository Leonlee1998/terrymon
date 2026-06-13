'use client'
import WaitingColumn from '@/components/doctor/WaitingColumn'
import InProgressColumn from '@/components/doctor/InProgressColumn'
import DoneColumn from '@/components/doctor/DoneColumn'

export default function QueuePage() {
  return (
    <div className="flex h-[calc(100vh-56px)] divide-x divide-border-t">
      <WaitingColumn />
      <InProgressColumn />
      <DoneColumn />
    </div>
  )
}
