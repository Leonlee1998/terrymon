'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKioskStore } from '@/stores/kioskStore'

type Phase = 'connecting' | 'measuring' | 'done'

const NUMPAD = ['1','2','3','4','5','6','7','8','9','.','0','⌫']

export default function KioskWeight() {
  const router = useRouter()
  const { selectedPet, setWeight, assignQueue } = useKioskStore()
  const [phase, setPhase] = useState<Phase>('connecting')
  const [displayWeight, setDisplayWeight] = useState('0.0')
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')

  useEffect(() => {
    if (!selectedPet) { router.replace('/kiosk'); return }
  }, [selectedPet, router])

  useEffect(() => {
    if (manualMode) return
    const t1 = setTimeout(() => setPhase('measuring'), 1000)
    const t2 = setTimeout(() => {
      const target = 9.4
      let current = 0
      const steps = 30
      const interval = setInterval(() => {
        current = Math.min(current + target / steps, target)
        setDisplayWeight(current.toFixed(1))
        if (current >= target) {
          clearInterval(interval)
          setPhase('done')
          setWeight(target.toFixed(1))
        }
      }, 800 / steps)
      return () => clearInterval(interval)
    }, 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [manualMode, setWeight])

  if (!selectedPet) return null

  function handleNumpad(key: string) {
    setManualInput(prev => {
      if (key === '⌫') return prev.slice(0, -1)
      if (key === '.' && prev.includes('.')) return prev
      if (key === '.' && prev === '') return '0.'
      if (key !== '.' && prev === '0') return key
      return prev + key
    })
  }

  function handleConfirm() {
    const val = manualMode ? manualInput : displayWeight
    setWeight(parseFloat(val).toFixed(1))
    assignQueue()
    router.push('/kiosk/waiting')
  }

  const shown = manualMode ? (manualInput || '0.0') : displayWeight
  const canConfirm = phase === 'done' || (manualMode && !!manualInput && parseFloat(manualInput) > 0)

  return (
    <div className="flex-1 flex flex-col">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => router.back()} className="text-white/70 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <span className="text-white font-semibold">{selectedPet.name} 的體重量測</span>
      </div>

      {/* Weight circle */}
      <div className="w-56 h-56 rounded-full border-4 border-primary flex flex-col items-center justify-center bg-white shadow-lg mx-auto my-8">
        <span className="text-6xl font-black text-primary">{shown}</span>
        <span className="text-slate-t font-medium">kg</span>
      </div>

      {/* Status text */}
      <div className="flex items-center justify-center gap-2 h-6 mb-1">
        {!manualMode && phase === 'connecting' && (
          <>
            <Loader2 size={16} className="animate-spin text-white/60" />
            <span className="text-white/60 text-sm">正在連接體重機...</span>
          </>
        )}
        {!manualMode && phase === 'measuring' && (
          <span className="text-blue-200 text-sm flex items-center gap-2">
            {[0,1,2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
            量測中...
          </span>
        )}
        {!manualMode && phase === 'done' && (
          <span className="text-green-300 text-sm font-semibold">✅ 量測完成</span>
        )}
      </div>

      {/* Last weight (shown after done) */}
      {!manualMode && phase === 'done' && (
        <p className="text-xs text-white/50 text-center mb-4">
          上次體重：{selectedPet.weight} kg
        </p>
      )}

      {/* Manual toggle */}
      <button
        onClick={() => setManualMode(m => !m)}
        className="text-xs text-white/50 underline text-center mb-4"
      >
        {manualMode ? '使用自動量測' : '手動輸入體重'}
      </button>

      {/* Number pad */}
      {manualMode && (
        <div className="grid grid-cols-3 gap-2 px-6 mb-4">
          {NUMPAD.map(key => (
            <button
              key={key}
              onClick={() => handleNumpad(key)}
              className="h-14 w-full bg-white border border-border-t rounded-xl font-bold text-xl text-ink hover:bg-primary-bg active:scale-95 transition-transform"
            >
              {key}
            </button>
          ))}
        </div>
      )}

      {/* Confirm button */}
      {canConfirm && (
        <div className="px-6 pb-8 mt-auto">
          <Button
            onClick={handleConfirm}
            className="w-full h-14 text-lg font-bold bg-white text-primary hover:bg-primary-bg rounded-2xl"
          >
            確認體重，完成掛號
          </Button>
        </div>
      )}
    </div>
  )
}
