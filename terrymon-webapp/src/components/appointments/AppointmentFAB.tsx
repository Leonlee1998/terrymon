'use client'
import { useState } from 'react'
import { Plus, X, Stethoscope, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

type AppType = 'vet' | 'grooming'

const OPTIONS = [
  { icon: Stethoscope, label: '獸醫掛號', type: 'vet' as AppType,      color: 'bg-primary-bg text-primary border-primary/20' },
  { icon: Scissors,    label: '美容預約', type: 'grooming' as AppType, color: 'bg-accent-light text-accent border-accent/20' },
]

export default function AppointmentFAB() {
  const { member } = useAuthStore()
  const [fabOpen, setFabOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [appType, setAppType] = useState<AppType>('vet')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ petId: '', date: '', time: '', location: '', notes: '' })

  function handleSelect(type: AppType) {
    setAppType(type)
    setFabOpen(false)
    setForm({
      petId: member?.pets[0]?.id ?? '',
      date: '', time: '', location: '', notes: '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.date || !form.time || !form.location.trim()) {
      toast.error('請填寫日期、時間與地點')
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setDialogOpen(false)
    toast.success('預約已送出，等待確認通知！')
  }

  const typeLabel = appType === 'vet' ? '獸醫掛號' : '美容預約'
  const btnClass  = appType === 'vet' ? 'bg-primary hover:bg-primary-hover' : 'bg-accent hover:bg-accent/90'

  return (
    <>
      {fabOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setFabOpen(false)} />
      )}

      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-50 flex flex-col items-end gap-2">
        {fabOpen && OPTIONS.map(({ icon: Icon, label, type, color }) => (
          <button
            key={label}
            onClick={() => handleSelect(type)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-lg text-sm font-medium bg-white ${color}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}

        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-hover transition-all active:scale-95"
        >
          {fabOpen
            ? <X size={22} className="transition-transform rotate-180" />
            : <Plus size={22} />}
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增{typeLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {member && member.pets.length > 1 && (
              <div>
                <label className="text-sm font-medium text-ink block mb-1">選擇寵物</label>
                <select
                  value={form.petId}
                  onChange={e => setForm(f => ({ ...f, petId: e.target.value }))}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  {member.pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink block mb-1">預約日期 *</label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-ink block mb-1">預約時間 *</label>
                <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">
                {appType === 'vet' ? '診所名稱' : '美容店名'} *
              </label>
              <Input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder={appType === 'vet' ? '台北動物醫院' : '毛毛美容院'}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">備注（選填）</label>
              <Input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="任何特殊需求或症狀描述"
              />
            </div>
            <Button onClick={handleSubmit} disabled={saving} className={`w-full text-white ${btnClass}`}>
              {saving ? '送出中…' : '送出預約'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
