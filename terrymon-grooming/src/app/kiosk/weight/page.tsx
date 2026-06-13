'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bluetooth, CheckCircle2, Keyboard } from 'lucide-react'
import { useKioskStore, generateQueueNum } from '@/stores/kioskStore'
import { posApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type MeasurePhase = 'connecting' | 'measuring' | 'done'

export default function KioskWeight() {
  const router = useRouter()
  const { selectedPet, setWeight, setQueueNum } = useKioskStore()
  const [phase, setPhase]             = useState<MeasurePhase>('connecting')
  const [displayWeight, setDisplayWeight] = useState('0.0')
  const [manualMode, setManualMode]   = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [confirming, setConfirming]   = useState(false)
  const finalWeight = useRef(9.4)

  useEffect(() => {
    if (!selectedPet) { router.replace('/kiosk'); return }
    finalWeight.current = parseFloat((selectedPet.weight + (Math.random() * 0.4 - 0.2)).toFixed(1))

    const t1 = setTimeout(() => setPhase('measuring'), 1200)

    const t2 = setTimeout(() => {
      const target = finalWeight.current
      const steps = 25
      const interval = setInterval(() => {
        setDisplayWeight(prev => {
          const curr = parseFloat(prev)
          const next = Math.min(curr + target / steps, target)
          if (next >= target) {
            clearInterval(interval)
            setPhase('done')
            return target.toFixed(1)
          }
          return next.toFixed(1)
        })
      }, 900 / steps)
      return () => clearInterval(interval)
    }, 2000)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [selectedPet, router])

  async function handleConfirm() {
    const w = manualMode ? manualInput : displayWeight
    if (!w || parseFloat(w) <= 0) { toast.error('請確認體重數值'); return }

    setConfirming(true)
    const queueNum = generateQueueNum()
    setWeight(w)
    setQueueNum(queueNum)
    await posApi.checkin({ memberId: selectedPet!.memberId, petId: selectedPet!.id, weight: parseFloat(w), queueNum })
    router.push('/kiosk/waiting')
  }

  function handleNumpad(key: string) {
    if (key === '⌫') {
      setManualInput(p => p.slice(0, -1))
    } else if (key === '.') {
      if (!manualInput.includes('.')) setManualInput(p => p + '.')
    } else {
      if (manualInput.length < 5) setManualInput(p => p + key)
    }
  }

  if (!selectedPet) return null

  const currentWeight = manualMode ? (manualInput || '—') : displayWeight
  const weightColor = phase === 'done' ? 'text-primary' : 'text-ink/40'
  const canConfirm = (manualMode ? parseFloat(manualInput) > 0 : phase === 'done') && !confirming

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-primary px-6 py-5 flex-shrink-0">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white mb-3">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white font-bold text-2xl">體重量測</h1>
        <p className="text-white/70 mt-1">{selectedPet.name} · {selectedPet.breed}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!manualMode ? (
          <>
            <div className={`w-56 h-56 rounded-full border-4 flex flex-col items-center justify-center shadow-lg mb-8 transition-all duration-500 ${
              phase === 'done' ? 'border-primary shadow-primary/20' : 'border-border-t'
            }`}>
              <span className={`text-7xl font-black tabular-nums transition-colors duration-300 ${weightColor}`}>
                {currentWeight}
              </span>
              <span className="text-slate-t font-medium text-lg mt-1">kg</span>
            </div>

            <div className="flex items-center gap-3 mb-6 h-8">
              {phase === 'connecting' && (
                <div className="flex items-center gap-2 text-slate-t">
                  <Bluetooth size={18} className="animate-pulse text-blue-500" />
                  <span>正在連接智慧體重秤...</span>
                </div>
              )}
              {phase === 'measuring' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                           style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span>量測中...</span>
                </div>
              )}
              {phase === 'done' && (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">量測完成！</span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-t mb-8">上次紀錄：{selectedPet.weight} kg</p>

            <button
              onClick={() => { setManualMode(true); setManualInput(displayWeight) }}
              className="flex items-center gap-1.5 text-slate-t text-sm hover:text-primary transition-colors"
            >
              <Keyboard size={16} />
              手動輸入體重
            </button>
          </>
        ) : (
          <div className="w-full max-w-xs">
            <div className="w-full h-24 rounded-2xl border-2 border-primary bg-primary-bg flex items-center justify-center mb-6">
              <span className="text-5xl font-black text-primary tabular-nums">
                {manualInput || '0.0'}
              </span>
              <span className="text-slate-t text-xl ml-2">kg</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(key => (
                <button
                  key={key}
                  onClick={() => handleNumpad(key)}
                  className="h-16 rounded-2xl bg-white border-2 border-border-t font-bold text-xl text-ink hover:border-primary hover:bg-primary-bg transition-all active:scale-95"
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              onClick={() => setManualMode(false)}
              className="w-full mt-4 text-sm text-slate-t hover:text-primary"
            >
              ← 返回自動量測
            </button>
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="w-full max-w-xs h-14 bg-primary hover:bg-primary-hover text-white font-bold text-lg mt-8 disabled:opacity-40"
        >
          {confirming ? '掛號中...' : `確認 ${currentWeight} kg，完成掛號 →`}
        </Button>
      </div>
    </div>
  )
}
