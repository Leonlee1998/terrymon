'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Stethoscope, Scissors, NotebookPen } from 'lucide-react'
import { toast } from 'sonner'
import AddEventDialog from '@/components/home/AddEventDialog'

interface Props { defaultDate?: string; onEventCreated?: () => void }

export default function AppointmentFAB({ defaultDate, onEventCreated }: Props) {
  const router = useRouter()
  const [fabOpen, setFabOpen]     = useState(false)
  const [addEvent, setAddEvent]   = useState(false)

  function handleSelect(type: 'vet' | 'grooming' | 'event') {
    setFabOpen(false)
    if (type === 'grooming') {
      router.push('/appointments/new')
    } else if (type === 'event') {
      setAddEvent(true)
    } else {
      toast.info('獸醫掛號功能即將推出')
    }
  }

  return (
    <>
      {fabOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setFabOpen(false)} />
      )}

      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-50 flex flex-col items-end gap-2">
        {fabOpen && (
          <>
            <button
              onClick={() => handleSelect('event')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-lg text-sm font-medium bg-white text-violet-600 border-violet-200"
            >
              <NotebookPen size={16} />
              新增事件
            </button>
            <button
              onClick={() => handleSelect('vet')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-lg text-sm font-medium bg-white text-blue-600 border-blue-200"
            >
              <Stethoscope size={16} />
              獸醫掛號
            </button>
            <button
              onClick={() => handleSelect('grooming')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-lg text-sm font-medium bg-white text-primary border-primary/20"
            >
              <Scissors size={16} />
              美容預約
            </button>
          </>
        )}

        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-hover transition-all active:scale-95"
        >
          {fabOpen
            ? <X size={22} className="transition-transform rotate-180" />
            : <Plus size={22} />}
        </button>
      </div>

      <AddEventDialog
        open={addEvent}
        defaultDate={defaultDate}
        onOpenChange={setAddEvent}
        onCreated={() => { setAddEvent(false); onEventCreated?.() }}
      />
    </>
  )
}
