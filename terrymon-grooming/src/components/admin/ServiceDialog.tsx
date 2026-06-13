'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { KioskService } from '@/types'

const schema = z.object({
  name: z.string().min(1, '必填'),
  description: z.string(),
  price: z.number().min(0, '必填'),
  duration: z.number().min(0),
  isAddon: z.boolean(),
  enabled: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: KioskService | null
  onSave: (data: Omit<KioskService, 'id'>) => void
}

const DEFAULTS: FormValues = { name: '', description: '', price: 0, duration: 0, isAddon: false, enabled: true }

export default function ServiceDialog({ open, onOpenChange, editTarget, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  })

  useEffect(() => {
    if (open) reset(editTarget ?? DEFAULTS)
  }, [open, editTarget, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editTarget ? '編輯服務' : '新增服務'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">名稱 *</label>
            <Input {...register('name')} placeholder="服務名稱" />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">說明</label>
            <Textarea {...register('description')} placeholder="服務說明" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">價格 (NT$) *</label>
              <Input type="number" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="text-xs text-error mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">時長 (分鐘)</label>
              <Input type="number" {...register('duration', { valueAsNumber: true })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover text-white">儲存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
