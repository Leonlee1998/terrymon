'use client'
import { Input } from '@/components/ui/input'
import type { Pet } from '@/types'

export type CardFields = {
  gender: Pet['gender'] | ''
  isNeutered: boolean
  bloodType: string
  caregiver: string
}

interface Props {
  form: CardFields
  onChange: (patch: Partial<CardFields>) => void
}

export default function PetCardFields({ form, onChange }: Props) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-ink">性別</span>
          <select
            value={form.gender}
            onChange={e => onChange({ gender: e.target.value as CardFields['gender'] })}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="">未填寫</option>
            <option value="male">公</option>
            <option value="female">母</option>
          </select>
        </label>
        <label className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            checked={form.isNeutered}
            onChange={e => onChange({ isNeutered: e.target.checked })}
            className="h-4 w-4 rounded border-border-t accent-primary"
          />
          <span className="text-sm font-medium text-ink">已結紮</span>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-ink">血型</span>
          <Input
            value={form.bloodType}
            onChange={e => onChange({ bloodType: e.target.value })}
            placeholder="例：DEA 1.1+、A型"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-ink">照顧者</span>
          <Input
            value={form.caregiver}
            onChange={e => onChange({ caregiver: e.target.value })}
            placeholder="例：王小明"
          />
        </label>
      </div>
    </>
  )
}
