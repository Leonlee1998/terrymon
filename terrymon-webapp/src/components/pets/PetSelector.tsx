'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Pet, Species } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

export default function PetSelector({ pets, activePetId }: { pets: Pet[]; activePetId: string }) {
  const { member, addPet } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', species: 'dog' as Species, breed: '',
    birthDate: '', weight: '', allergies: '', notes: '',
  })

  async function handleAddPet() {
    if (!form.name.trim() || !form.breed.trim() || !form.birthDate) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    const newPet: Pet = {
      id: `PET_${Date.now()}`,
      memberId: member?.id ?? 'M001',
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      birthDate: form.birthDate,
      weight: parseFloat(form.weight) || 5,
      photoUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(form.name)}`,
      allergies: form.allergies
        ? form.allergies.split(/[、,]/).map(s => s.trim()).filter(Boolean)
        : [],
      notes: form.notes.trim(),
      isActive: true,
    }
    addPet(newPet)
    setSaving(false)
    setOpen(false)
    setForm({ name: '', species: 'dog', breed: '', birthDate: '', weight: '', allergies: '', notes: '' })
    toast.success(`${newPet.name} 已新增！`)
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {pets.map(pet => {
          const active = pet.id === activePetId
          return (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className={cn(
                'flex flex-col items-center gap-1.5 flex-shrink-0 transition-all',
                active ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              )}
            >
              <div className={cn(
                'w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all',
                active ? 'border-primary shadow-md shadow-primary/20' : 'border-transparent'
              )}>
                <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
              </div>
              <span className={cn('text-xs font-medium', active ? 'text-primary' : 'text-slate-t')}>
                {pet.name}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 opacity-50 hover:opacity-80 transition-opacity"
        >
          <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-border-t flex items-center justify-center">
            <Plus size={20} className="text-slate-t" />
          </div>
          <span className="text-xs text-slate-t">新增</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增寵物</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink block mb-1">寵物姓名 *</label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="小花"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink block mb-1">物種</label>
                <select
                  value={form.species}
                  onChange={e => setForm(f => ({ ...f, species: e.target.value as Species }))}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="dog">狗 🐕</option>
                  <option value="cat">貓 🐈</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink block mb-1">品種 *</label>
                <Input
                  value={form.breed}
                  onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                  placeholder="柴犬"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink block mb-1">體重 (kg)</label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                  placeholder="5.2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">生日 *</label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">過敏史（以「、」分隔）</label>
              <Input
                value={form.allergies}
                onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))}
                placeholder="雞肉、牛奶"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">備注</label>
              <Input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="個性活潑"
              />
            </div>
            <Button
              onClick={handleAddPet}
              disabled={saving || !form.name.trim() || !form.breed.trim() || !form.birthDate}
              className="w-full bg-primary hover:bg-primary-hover text-white"
            >
              {saving ? '新增中…' : '新增寵物'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
