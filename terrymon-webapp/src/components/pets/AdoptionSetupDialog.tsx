'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, PawPrint, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { Pet } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

const DEFAULT_QUESTIONS = [
  '寵物目前的飲食狀況如何？',
  '寵物的健康狀況和行為有哪些變化？',
  '認養後的居住環境是否適合寵物？',
]

const MONTHS_OPTIONS = [1, 3, 6, 12]

interface FoundMember { id: string; name: string; handle?: string }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  pets: Pet[]
  onSuccess?: () => void
}

export default function AdoptionSetupDialog({ open, onOpenChange, pets, onSuccess }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'pet' | 'adopter' | 'schedule' | 'done'>('pet')
  const [selectedPetId, setSelectedPetId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundMember, setFoundMember] = useState<FoundMember | null>(null)
  const [scheduleMonths, setScheduleMonths] = useState<number[]>([1, 3, 6])
  const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setStep('pet')
    setSelectedPetId('')
    setSearchQuery('')
    setFoundMember(null)
    setScheduleMonths([1, 3, 6])
    setQuestions(DEFAULT_QUESTIONS)
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setFoundMember(null)
    try {
      const result = await api.searchMemberForInvite(searchQuery.trim())
      if (result.found && result.member) {
        setFoundMember(result.member as FoundMember)
      } else {
        toast.error('找不到此會員，請確認電話/Email/@handle')
      }
    } catch {
      toast.error('搜尋失敗，請再試一次')
    } finally {
      setSearching(false)
    }
  }

  function toggleMonth(m: number) {
    setScheduleMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m].sort((a, b) => a - b)
    )
  }

  async function handleSubmit() {
    if (!foundMember || !selectedPetId || !scheduleMonths.length) return
    const emptyQ = questions.some(q => !q.trim())
    if (emptyQ) { toast.error('請填寫所有問題'); return }
    setSubmitting(true)
    try {
      await api.createAdoptionPlan({
        petId: selectedPetId,
        adopterMemberId: foundMember.id,
        adoptionDate: new Date().toISOString().slice(0, 10),
        scheduleMonths,
        reportQuestions: questions.map(q => q.trim()),
      })
      setStep('done')
      onSuccess?.()
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message ?? '建立失敗，請再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPet = pets.find(p => p.id === selectedPetId)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>建立送養追蹤計畫</DialogTitle>
        </DialogHeader>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle size={48} className="text-success" />
            <p className="text-center font-bold text-ink">送養追蹤計畫已建立</p>
            <p className="text-center text-sm text-slate-t">認養人將收到通知，並依排程收到回報提醒</p>
            <Button className="w-full bg-primary text-white" onClick={() => { reset(); onOpenChange(false) }}>
              完成
            </Button>
          </div>
        ) : step === 'pet' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-t">選擇要建立追蹤的寵物</p>
            {pets.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-t">尚無寵物資料</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetId(pet.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      selectedPetId === pet.id
                        ? 'border-primary bg-primary-bg'
                        : 'border-border-t hover:bg-surface'
                    }`}
                  >
                    {pet.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pet.photoUrl} alt={pet.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-bg">
                        <PawPrint size={18} className="text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-ink">{pet.name}</p>
                      <p className="text-xs text-slate-t">{pet.breed || pet.species}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Button
              disabled={!selectedPetId}
              onClick={() => setStep('adopter')}
              className="w-full bg-primary text-white"
            >
              下一步：設定認養人
            </Button>
          </div>
        ) : step === 'adopter' ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-primary-bg px-3 py-2 text-sm font-medium text-primary">
              寵物：{selectedPet?.name}
            </div>
            <p className="text-sm text-slate-t">搜尋認養人（電話 / Email / @handle）</p>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="@handle、電話或 Email"
              />
              <Button variant="outline" onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </Button>
            </div>
            {foundMember && (
              <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary-bg p-3">
                <CheckCircle size={16} className="text-primary" />
                <div>
                  <p className="font-medium text-ink">{foundMember.name}</p>
                  {foundMember.handle && <p className="text-xs text-slate-t">@{foundMember.handle}</p>}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('pet')}>上一步</Button>
              <Button
                disabled={!foundMember}
                onClick={() => setStep('schedule')}
                className="flex-1 bg-primary text-white"
              >
                下一步：回報排程
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-slate-t">
              寵物：{selectedPet?.name}｜認養人：{foundMember?.name}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">回報時間點（月）</p>
              <div className="flex gap-2">
                {MONTHS_OPTIONS.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMonth(m)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      scheduleMonths.includes(m)
                        ? 'bg-primary text-white'
                        : 'border border-border-t text-slate-t hover:border-primary'
                    }`}
                  >
                    第 {m} 月
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink">回報問題</p>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <Textarea
                    key={i}
                    value={q}
                    onChange={e => setQuestions(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                    rows={2}
                    className="resize-none text-sm"
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('adopter')}>上一步</Button>
              <Button
                disabled={submitting || !scheduleMonths.length}
                onClick={handleSubmit}
                className="flex-1 bg-primary text-white"
              >
                {submitting ? '建立中...' : '建立計畫'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
