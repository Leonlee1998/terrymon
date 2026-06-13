'use client'
import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueueStore } from '@/stores/queueStore'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { COMMON_DIAGNOSES, COMMON_MEDICINES } from '@/lib/mock'
import PrescriptionModal from './PrescriptionModal'

const rxSchema = z.object({
  medicine: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  days: z.number().int().min(1),
})

const schema = z.object({
  chiefComplaint: z.string().min(1, '請填寫主訴'),
  diagnosis: z.string().min(1, '請填寫診斷'),
  clinicalFindings: z.string().optional(),
  notes: z.string().optional(),
  needsFollowUp: z.boolean(),
  followUpDate: z.string().optional(),
  prescriptions: z.array(rxSchema),
})

type F = z.infer<typeof schema>

const inputCls = 'h-9 rounded-lg border border-input bg-transparent px-2 text-sm focus:outline-none focus:border-ring'

export default function ConsultationForm() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const inProgress = useQueueStore((s) => s.inProgress)
  const completeCurrent = useQueueStore((s) => s.completeCurrent)

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<F>({
      resolver: zodResolver(schema),
      defaultValues: { needsFollowUp: false, prescriptions: [] },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'prescriptions' })
  const watchDiag = watch('diagnosis')
  const watchFollowUp = watch('needsFollowUp')

  function onComplete(_: F) {
    completeCurrent()
    toast.success('看診完成，已通知客戶取件')
    router.push('/doctor')
  }

  return (
    <form
      onSubmit={handleSubmit(onComplete)}
      className="bg-card rounded-2xl p-5 flex flex-col gap-5 overflow-y-auto"
    >
      <h2 className="text-lg font-bold shrink-0">看診紀錄</h2>

      {/* 主訴 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">主訴 *</label>
        <Textarea {...register('chiefComplaint')} placeholder="描述主要症狀..." rows={2} />
        {errors.chiefComplaint && (
          <p className="text-xs text-destructive">{errors.chiefComplaint.message}</p>
        )}
      </div>

      {/* 診斷 chips + 輸入 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">診斷 *</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_DIAGNOSES.map((d) => (
            <button
              key={d} type="button"
              onClick={() => setValue('diagnosis', d, { shouldValidate: true })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                watchDiag === d
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <Textarea {...register('diagnosis')} placeholder="或自行輸入診斷..." rows={1} />
        {errors.diagnosis && (
          <p className="text-xs text-destructive">{errors.diagnosis.message}</p>
        )}
      </div>

      {/* 處方 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">處方</label>
          <Button
            type="button" size="xs" variant="outline"
            onClick={() => append({
              medicine: COMMON_MEDICINES[0].name,
              dosage: COMMON_MEDICINES[0].defaultDose,
              frequency: COMMON_MEDICINES[0].defaultFreq,
              days: 7,
            })}
          >
            <Plus size={12} /> 新增
          </Button>
        </div>
        {fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center">
            <select {...register(`prescriptions.${i}.medicine`)} className={inputCls}>
              {COMMON_MEDICINES.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
            <input {...register(`prescriptions.${i}.dosage`)} placeholder="劑量" className={inputCls} />
            <input {...register(`prescriptions.${i}.frequency`)} placeholder="頻次" className={inputCls} />
            <input {...register(`prescriptions.${i}.days`, { valueAsNumber: true })} placeholder="天" type="number" min={1} className={inputCls} />
            <button type="button" onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* 複診 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">需要複診</label>
        <Controller control={control} name="needsFollowUp"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        {watchFollowUp && (
          <input type="date" {...register('followUpDate')} className={`${inputCls} ml-2`} />
        )}
      </div>

      {/* 備注 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">備注</label>
        <Textarea {...register('notes')} placeholder="其他說明..." rows={2} />
      </div>

      {/* 操作列 */}
      <div className="sticky bottom-0 bg-card pt-3 flex gap-3 border-t border-border mt-auto">
        <Button type="button" variant="outline" onClick={() => setShowModal(true)}>
          預覽藥單
        </Button>
        <Button type="submit" className="flex-1">看診完成</Button>
      </div>

      {inProgress && (
        <PrescriptionModal
          open={showModal}
          onClose={() => setShowModal(false)}
          patient={inProgress}
          formValues={watch()}
        />
      )}
    </form>
  )
}
