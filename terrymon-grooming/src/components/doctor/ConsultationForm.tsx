'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQueueStore } from '@/stores/queueStore'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const schema = z.object({
  skinCondition: z.string().optional(),
  notes: z.string().optional(),
})

type F = z.infer<typeof schema>

export default function ConsultationForm() {
  const router = useRouter()
  const completeCurrent = useQueueStore((s) => s.completeCurrent)

  const { register, handleSubmit } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { skinCondition: '', notes: '' },
  })

  function onComplete(_: F) {
    completeCurrent()
    toast.success('美容完成！已通知客戶取件')
    router.push('/doctor')
  }

  return (
    <form
      onSubmit={handleSubmit(onComplete)}
      className="bg-card rounded-2xl p-5 flex flex-col gap-5 overflow-y-auto"
    >
      <h2 className="text-lg font-bold shrink-0">美容紀錄</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">皮膚與毛髮狀況</label>
        <Textarea
          {...register('skinCondition')}
          placeholder="記錄皮膚狀況、毛髮情形、打結程度等..."
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">備注</label>
        <Textarea
          {...register('notes')}
          placeholder="客人特殊需求、注意事項、下次預約建議..."
          rows={4}
        />
      </div>

      <div className="sticky bottom-0 bg-card pt-3 border-t border-border mt-auto">
        <Button type="submit" className="w-full">✂️ 美容完成</Button>
      </div>
    </form>
  )
}
