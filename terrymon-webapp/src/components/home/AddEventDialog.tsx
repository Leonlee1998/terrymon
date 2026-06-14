'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'

const schema = z.object({
  title: z.string().min(1, '請輸入事件名稱'),
  petId: z.string().optional(),
  date: z.string().min(1, '請選擇日期'),
  time: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  defaultDate?: string
  onOpenChange: (v: boolean) => void
  onCreated?: () => void
}

export default function AddEventDialog({ open, defaultDate, onOpenChange, onCreated }: Props) {
  const { member } = useAuthStore()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: defaultDate ?? new Date().toISOString().slice(0, 10) },
  })

  async function onSubmit(values: FormValues) {
    try {
      await api.createMemberEvent({
        title: values.title,
        petId: values.petId || undefined,
        date: values.date,
        time: values.time || undefined,
        notes: values.notes || undefined,
      })
      toast.success('事件已新增')
      reset({ date: values.date })
      onOpenChange(false)
      onCreated?.()
    } catch {
      toast.error('新增失敗，請稍後再試')
    }
  }

  const inputCls = 'w-full rounded-xl border border-border-t bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary'

  return (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>新增個人事件</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">事件名稱 *</label>
            <input {...register('title')} placeholder="例：帶 Mochi 複診、打疫苗提醒…" className={inputCls} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {member && member.pets.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">關聯寵物（選填）</label>
              <select {...register('petId')} className={inputCls}>
                <option value="">不關聯特定寵物</option>
                {member.pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">日期 *</label>
              <input type="date" {...register('date')} className={inputCls} />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">時間（選填）</label>
              <input type="time" {...register('time')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">備註（選填）</label>
            <textarea {...register('notes')} rows={2} placeholder="補充說明…" className={`${inputCls} resize-none`} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '新增中…' : '新增事件'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
