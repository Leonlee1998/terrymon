'use client'
import WaitingColumn from '@/components/doctor/WaitingColumn'
import InProgressColumn from '@/components/doctor/InProgressColumn'
import DoneColumn from '@/components/doctor/DoneColumn'

export default function DoctorQueue() {
  return (
    <div className="flex-1 flex divide-x divide-border-t overflow-hidden">
      <WaitingColumn />
      <InProgressColumn />
      <DoneColumn />
    </div>
  )
}
