'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useKioskStore } from '@/stores/kioskStore'
import { Button } from '@/components/ui/button'

type Groomer = { id: string; name: string; is_active: boolean }

const now = new Date()
const WALK_IN_SLOTS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00']
  .filter(t => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m > now.getHours() * 60 + now.getMinutes()
  })

export default function KioskSchedule() {
  const router = useRouter()
  const { member, selectedGroomer, selectedTime, setGroomer, setGroomerId, setTime } = useKioskStore()
  const [step, setStep] = useState<'groomer' | 'time'>('groomer')
  const [groomers, setGroomers] = useState<Groomer[]>([])
  const [loadingGroomers, setLoadingGroomers] = useState(true)

  useEffect(() => {
    if (!member) router.replace('/kiosk')
  }, [member, router])

  useEffect(() => {
    fetch('/api/admin/groomers')
      .then(r => r.json())
      .then((data: Groomer[]) => setGroomers(Array.isArray(data) ? data.filter(g => g.is_active) : []))
      .catch(() => {})
      .finally(() => setLoadingGroomers(false))
  }, [])

  if (!member) return null

  function selectGroomer(groomer: Groomer | null) {
    if (groomer) {
      setGroomer(groomer.name)
      setGroomerId(groomer.id)
    } else {
      setGroomer('不指定')
      setGroomerId(null)
    }
    setStep('time')
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">
          {step === 'groomer' ? '選擇美容師' : '選擇時段'}
        </h1>
        <p className="text-white/70 mt-1">今日現場報到</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {step === 'groomer' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-t mb-4">請選擇您希望的美容師</p>
            {loadingGroomers ? (
              <div className="flex justify-center py-8">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                {groomers.map(groomer => (
                  <button
                    key={groomer.id}
                    onClick={() => selectGroomer(groomer)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                      selectedGroomer === groomer.name
                        ? 'border-primary bg-primary-bg'
                        : 'border-border-t hover:border-primary/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {groomer.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-ink text-lg">{groomer.name}</p>
                      <p className="text-slate-t text-sm">今日 {WALK_IN_SLOTS.length} 個可用時段</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => selectGroomer(null)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-border-t text-slate-t hover:border-primary hover:text-primary transition-colors"
                >
                  不指定，安排有空的美容師
                </button>
              </>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setStep('groomer')}
              className="text-primary text-sm mb-4 flex items-center gap-1"
            >
              ← 重新選美容師
            </button>
            <p className="text-sm text-slate-t mb-4">{selectedGroomer} 今日可預約時段</p>
            <div className="grid grid-cols-3 gap-3">
              {(WALK_IN_SLOTS.length > 0 ? WALK_IN_SLOTS : ['10:00','11:00','13:00','14:00','15:00']).map(time => (
                <button
                  key={time}
                  onClick={() => setTime(time)}
                  className={`p-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    selectedTime === time
                      ? 'border-primary bg-primary text-white'
                      : 'border-border-t text-ink hover:border-primary'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedGroomer && selectedTime && (
        <div className="border-t border-border-t p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-t">預約時段</p>
              <p className="font-bold text-ink">{selectedTime} · {selectedGroomer}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/kiosk/pet')}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg"
          >
            確認時段，選擇寵物 →
          </Button>
        </div>
      )}
    </div>
  )
}
