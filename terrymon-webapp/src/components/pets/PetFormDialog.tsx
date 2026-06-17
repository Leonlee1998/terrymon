'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import PhotoUpload from './PhotoUpload'
import PetCardFields from './PetCardFields'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { BreedOption, Pet } from '@/types'

type PetForm = {
  name: string
  species: Pet['species']
  breedId: string
  breed: string
  birthDate: string
  weight: string
  photoUrl: string
  allergies: string
  chipId: string
  gender: Pet['gender'] | ''
  isNeutered: boolean
  bloodType: string
  caregiver: string
  notes: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet?: Pet | null
}

const emptyForm: PetForm = {
  name: '',
  species: 'dog',
  breedId: '',
  breed: '',
  birthDate: '',
  weight: '',
  photoUrl: '',
  allergies: '',
  chipId: '',
  gender: '',
  isNeutered: false,
  bloodType: '',
  caregiver: '',
  notes: '',
}

function parseAllergies(value: string) {
  return value
    .split(/[,\n、，]/)
    .map(item => item.trim())
    .filter(Boolean)
}

export default function PetFormDialog({ open, onOpenChange, pet }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <PetFormContent pet={pet} onOpenChange={onOpenChange} />}
    </Dialog>
  )
}

function initialForm(pet?: Pet | null, memberName?: string): PetForm {
  return pet ? {
      name: pet.name,
      species: pet.species,
      breedId: pet.breedId ?? '',
      breed: pet.breed,
    birthDate: pet.birthDate,
    weight: pet.weight ? String(pet.weight) : '',
    photoUrl: pet.photoUrl,
    allergies: pet.allergies.join('、'),
    chipId: pet.chipId ?? '',
    gender: pet.gender ?? '',
    isNeutered: pet.isNeutered ?? false,
    bloodType: pet.bloodType ?? '',
    caregiver: pet.caregiver ?? '',
    notes: pet.notes,
  } : { ...emptyForm, caregiver: memberName ?? '' }
}

function PetFormContent({ pet, onOpenChange }: Pick<Props, 'pet' | 'onOpenChange'>) {
  const router = useRouter()
  const { addPet, updatePet, removePet, member } = useAuthStore()
  const [form, setForm] = useState<PetForm>(() => initialForm(pet, member?.name))
  const [breeds, setBreeds] = useState<BreedOption[]>([])
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(pet)

  useEffect(() => {
    let ignore = false

    async function loadBreeds() {
      if (form.species !== 'dog' && form.species !== 'cat') {
        await Promise.resolve()
        if (!ignore) setBreeds([])
        return
      }

      const nextBreeds = await api.getBreeds(form.species)
      if (!ignore) setBreeds(nextBreeds)
    }

    void loadBreeds()

    return () => {
      ignore = true
    }
  }, [form.species])

  async function handleSave() {
    const name = form.name.trim()
    if (!name) {
      toast.error('請輸入寵物名字')
      return
    }

    const payload = {
      name,
      species: form.species,
      breedId: form.breedId,
      breed: form.breed.trim(),
      birthDate: form.birthDate,
      weight: form.weight ? Number(form.weight) : 0,
      photoUrl: form.photoUrl.trim(),
      allergies: parseAllergies(form.allergies),
      chipId: form.chipId.trim(),
      gender: form.gender || undefined,
      isNeutered: form.isNeutered,
      bloodType: form.bloodType.trim() || undefined,
      caregiver: form.caregiver.trim() || undefined,
      notes: form.notes.trim(),
    }

    setSaving(true)
    try {
      const nextPet = pet
        ? await api.updatePet(pet.id, payload)
        : await api.createPet(payload)

      if (pet) updatePet(nextPet)
      else addPet(nextPet)

      toast.success(pet ? '寵物資料已更新' : '已新增寵物')
      onOpenChange(false)
      router.push('/pets')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!pet) return
    if (!window.confirm(`確定要移除「${pet.name}」嗎？`)) return

    setSaving(true)
    try {
      await api.archivePet(pet.id)
      removePet(pet.id)
      toast.success('寵物已移除')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '移除失敗')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '編輯寵物資料' : '新增寵物'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">名字 *</span>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">物種</span>
              <select
                value={form.species}
                onChange={e => setForm(f => ({
                  ...f,
                  species: e.target.value as Pet['species'],
                  breedId: '',
                  breed: '',
                }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="dog">狗狗</option>
                <option value="cat">貓咪</option>
                <option value="other">其他</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">品種</span>
              {form.species === 'dog' || form.species === 'cat' ? (
                <select
                  value={form.breedId}
                  onChange={e => {
                    const selected = breeds.find(breed => breed.id === e.target.value)
                    setForm(f => ({
                      ...f,
                      breedId: selected?.id ?? '',
                      breed: selected?.nameZh ?? '',
                    }))
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">請選擇{form.species === 'dog' ? '狗狗' : '貓咪'}品種</option>
                  {breeds.map(breed => (
                    <option key={breed.id} value={breed.id}>
                      {breed.nameZh}{breed.legalStatusTw === 'prohibited' ? '（台灣禁止）' : breed.legalStatusTw === 'restricted' ? '（需確認）' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value, breedId: '' }))} />
              )}
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">體重 kg</span>
              <Input type="number" min="0" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">生日</span>
              <Input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">晶片號碼</span>
              <Input value={form.chipId} onChange={e => setForm(f => ({ ...f, chipId: e.target.value }))} />
            </label>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-ink">寵物照片</span>
            <PhotoUpload value={form.photoUrl} onChange={url => setForm(f => ({ ...f, photoUrl: url }))} />
          </div>

          <PetCardFields
            form={{ gender: form.gender, isNeutered: form.isNeutered, bloodType: form.bloodType, caregiver: form.caregiver }}
            onChange={patch => setForm(f => ({ ...f, ...patch } as typeof f))}
          />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">照護備註</span>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          </label>

          <div className="flex items-center gap-3 pt-2">
            {pet && (
              <Button type="button" variant="ghost" onClick={handleArchive} disabled={saving} className="text-red-600 hover:text-red-700">
                <Trash2 size={16} />
                移除
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="ml-auto">
              取消
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || !form.name.trim()} className="bg-primary text-white hover:bg-primary-hover">
              {saving ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </div>
    </DialogContent>
  )
}
