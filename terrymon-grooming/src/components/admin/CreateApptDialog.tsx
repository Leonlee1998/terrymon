'use client'
import { useState, useEffect } from 'react'
import { X, Search, Phone, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Groomer = { id: string; name: string }
type Service = { id: string; name: string; price: number; duration: number; is_addon: boolean }
type Pet = { id: string; name: string; species: string; breed: string }
type FoundMember = { id: string; name: string; phone: string; pets: Pet[] }

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function CreateApptDialog({
  groomers,
  onClose,
  onCreated,
}: {
  groomers: Groomer[]
  onClose: () => void
  onCreated: () => void
}) {
  const [phone, setPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [member, setMember] = useState<FoundMember | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [petId, setPetId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [groomerId, setGroomerId] = useState('')
  const [date, setDate] = useState(today())
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('電話預約')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/services')
      .then(r => r.json())
      .then((d: Service[]) => setServices(d))
      .catch(() => {})
  }, [])

  async function searchMember() {
    const digits = phone.replace(/[\s-]/g, '')
    if (digits.length < 8) return
    setSearching(true)
    try {
      const res = await fetch(`/api/admin/members?phone=${digits}`)
      const data = await res.json() as FoundMember | null
      if (!data) { toast.error('找不到此手機號碼的會員'); setMember(null) }
      else { setMember(data); setPetId(data.pets[0]?.id ?? '') }
    } catch {
      toast.error('查詢失敗')
    } finally {
      setSearching(false)
    }
  }

  async function handleSubmit() {
    if (!member || !petId || !serviceId || !date || !time) {
      toast.error('請填寫所有必要欄位')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id, petId, serviceId,
          date, time, groomerId: groomerId || undefined, notes,
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error)
      }
      toast.success('預約已建立（已確認）')
      onCreated()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '建立失敗')
    } finally {
      setSubmitting(false)
    }
  }

  const mainServices = services.filter(s => !s.is_addon)
  const selectedSvc = services.find(s => s.id === serviceId)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border-t px-5 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-bold text-ink text-lg">新增預約</h2>
            <p className="text-xs text-slate-t">電話 / 現場預約（已確認）</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface text-slate-t">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* 1. 搜尋會員 */}
          <div>
            <label className="text-xs font-semibold text-slate-t uppercase tracking-wide block mb-2">1. 搜尋會員</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t" />
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void searchMember()}
                  placeholder="輸入手機號碼"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-t text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => void searchMember()}
                disabled={searching}
                className="px-4 h-10 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
              >
                <Search size={14} />
                {searching ? '查詢中' : '查詢'}
              </button>
            </div>

            {member && (
              <div className="mt-3 bg-primary-bg rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {member.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{member.name}</p>
                  <p className="text-xs text-slate-t">{member.phone}・{member.pets.length} 隻寵物</p>
                </div>
              </div>
            )}
          </div>

          {/* 2. 選擇寵物 */}
          {member && member.pets.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-t uppercase tracking-wide block mb-2">2. 選擇寵物</label>
              <div className="flex flex-wrap gap-2">
                {member.pets.map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => setPetId(pet.id)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                      petId === pet.id
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-t bg-white text-ink hover:border-primary/40'
                    )}
                  >
                    {pet.species === 'cat' ? '🐱' : '🐶'} {pet.name}
                    <span className="ml-1 text-xs opacity-70">{pet.breed}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. 選擇服務 */}
          <div>
            <label className="text-xs font-semibold text-slate-t uppercase tracking-wide block mb-2">3. 選擇服務</label>
            <div className="relative">
              <select
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-xl border border-border-t text-sm bg-white appearance-none focus:outline-none focus:border-primary"
              >
                <option value="">請選擇…</option>
                {mainServices.map(s => (
                  <option key={s.id} value={s.id}>{s.name}（${s.price}・{s.duration}分鐘）</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-t pointer-events-none" />
            </div>
            {selectedSvc && (
              <p className="text-xs text-slate-t mt-1">預估費用 NT${selectedSvc.price}・服務時長 {selectedSvc.duration} 分鐘</p>
            )}
          </div>

          {/* 4. 日期 + 時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-t uppercase tracking-wide block mb-2">4. 日期</label>
              <input
                type="date"
                value={date}
                min={today()}
                onChange={e => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border-t text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-t uppercase tracking-wide block mb-2">時間</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border-t text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* 5. 美容師 */}
          <div>
            <label className="text-xs font-semibold text-slate-t uppercase tracking-wide block mb-2">5. 指定美容師（選填）</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setGroomerId('')}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                  groomerId === ''
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-t bg-white text-ink hover:border-primary/40'
                )}
              >
                不指定
              </button>
              {groomers.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGroomerId(g.id)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                    groomerId === g.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-border-t bg-white text-ink hover:border-primary/40'
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* 6. 備注 */}
          <div>
            <label className="text-xs font-semibold text-slate-t uppercase tracking-wide block mb-2">備注</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="電話預約"
              className="w-full h-10 px-3 rounded-xl border border-border-t text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting || !member || !petId || !serviceId}
            className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? '建立中…' : '確認建立預約'}
          </button>

        </div>
      </div>
    </div>
  )
}
