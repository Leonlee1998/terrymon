'use client'
import { useState } from 'react'
import { Edit2, AlertTriangle } from 'lucide-react'
import { calcAge, getSpeciesEmoji } from '@/lib/utils'
import { toast } from 'sonner'
import type { Pet } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

export default function PetProfileCard({ pet }: { pet: Pet }) {
  const { updatePet } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', breed: '', weight: '', birthDate: '',
    allergies: '', notes: '', chipId: '',
  })

  function handleOpenEdit() {
    setForm({
      name: pet.name, breed: pet.breed, weight: pet.weight.toString(),
      birthDate: pet.birthDate, allergies: pet.allergies.join('、'),
      notes: pet.notes, chipId: pet.chipId ?? '',
    })
    setOpen(true)
  }

  async function onSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    updatePet({
      ...pet,
      name: form.name.trim(),
      breed: form.breed.trim(),
      weight: parseFloat(form.weight) || pet.weight,
      birthDate: form.birthDate,
      allergies: form.allergies
        ? form.allergies.split(/[、,]/).map(s => s.trim()).filter(Boolean)
        : [],
      notes: form.notes.trim(),
      chipId: form.chipId.trim() || undefined,
    })
    setSaving(false)
    setOpen(false)
    toast.success('寵物資料已更新')
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-border-t p-4">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
            <span className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full p-0.5 shadow-sm">
              {getSpeciesEmoji(pet.species)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-black text-ink">{pet.name}</h2>
              <button
                onClick={handleOpenEdit}
                className="p-1.5 text-slate-t hover:text-primary transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <p className="text-slate-t text-sm">{pet.breed}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-surface border border-border-t text-xs text-ink px-2 py-0.5 rounded-full">
                {calcAge(pet.birthDate)}
              </span>
              <span className="bg-surface border border-border-t text-xs text-ink px-2 py-0.5 rounded-full">
                {pet.weight} kg
              </span>
              {pet.chipId && (
                <span className="bg-surface border border-border-t text-xs text-ink px-2 py-0.5 rounded-full">
                  晶片 {pet.chipId}
                </span>
              )}
            </div>
          </div>
        </div>

        {pet.allergies.length > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700">過敏史</p>
              <p className="text-xs text-red-600">{pet.allergies.join('、')}</p>
            </div>
          </div>
        )}

        {pet.notes && (
          <p className="mt-3 text-xs text-slate-t bg-surface rounded-xl px-3 py-2">
            💬 {pet.notes}
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯寵物資料</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink block mb-1">寵物姓名 *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-ink block mb-1">品種</label>
                <Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink block mb-1">體重 (kg)</label>
                <Input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-ink block mb-1">生日</label>
                <Input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">晶片號碼</label>
              <Input value={form.chipId} onChange={e => setForm(f => ({ ...f, chipId: e.target.value }))} placeholder="選填" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">過敏史（以「、」分隔）</label>
              <Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="雞肉、牛奶" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">備注</label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button
              onClick={onSave}
              disabled={saving || !form.name.trim()}
              className="w-full bg-primary hover:bg-primary-hover text-white"
            >
              {saving ? '儲存中…' : '儲存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
