'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ChevronLeft } from 'lucide-react'
import { useQueueStore } from '@/stores/queueStore'
import { posApi } from '@/services/api'
import { COMMON_MEDICINES, COMMON_DIAGNOSES } from '@/lib/mock'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ConsultationResult, PrescriptionItem, QueueItem } from '@/types'

const schema = z.object({
  chiefComplaint:   z.string().min(1, '請填寫主訴'),
  diagnosis:        z.string().min(1, '請填寫診斷'),
  clinicalFindings: z.string().optional(),
  treatment:        z.string().optional(),
  notes:            z.string().optional(),
  fee:              z.number().min(0),
  needsFollowUp:    z.boolean(),
  followUpDate:     z.string().optional(),
  prescriptions: z.array(z.object({
    medicine:  z.string().min(1),
    dosage:    z.string().min(1),
    frequency: z.string().min(1),
    days:      z.number().min(1),
  })),
})
type FormValues = z.infer<typeof schema>

export default function ConsultationForm() {
  const router = useRouter()
  const { inProgress, completeCurrent } = useQueueStore()
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      chiefComplaint: '', diagnosis: '', clinicalFindings: '',
      treatment: '', notes: '', fee: 800,
      needsFollowUp: false, followUpDate: '', prescriptions: [],
    },
  })

  const { fields: rxFields, append: addRx, remove: removeRx } = useFieldArray({
    control, name: 'prescriptions',
  })

  const watchedData = watch()
  const needsFollowUp = watch('needsFollowUp')
  const diagnosis = watch('diagnosis')

  function handleDiagnosisChip(d: string) {
    setValue('diagnosis', d)
  }

  function handleMedicineSelect(i: number, medicineName: string) {
    const med = COMMON_MEDICINES.find(m => m.name === medicineName)
    if (med) {
      setValue(`prescriptions.${i}.medicine`, med.name)
      setValue(`prescriptions.${i}.dosage`, med.defaultDose)
      setValue(`prescriptions.${i}.frequency`, med.defaultFreq)
    }
  }

  async function onSubmit(data: FormValues) {
    if (!inProgress) return
    setSubmitting(true)
    try {
      const result: ConsultationResult = {
        diagnosis:    data.diagnosis,
        prescriptions: data.prescriptions as PrescriptionItem[],
        notes:        data.notes ?? '',
        fee:          data.fee,
        followUpDate: data.needsFollowUp && data.followUpDate ? data.followUpDate : null,
      }
      await posApi.completeConsultation(inProgress.queueNum, inProgress, {
        ...result,
        chiefComplaint:   data.chiefComplaint,
        clinicalFindings: data.clinicalFindings ?? '',
      })
      completeCurrent(result)
      toast.success(`看診完成，已通知 ${inProgress.memberName} 取件`)
      router.push('/doctor')
    } catch (err) {
      toast.error('提交失敗：' + (err as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border-t flex-shrink-0 bg-white">
        <button type="button" onClick={() => router.back()} className="text-slate-t hover:text-ink">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-bold text-ink text-lg">看診紀錄</h2>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Chief complaint */}
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">
            主訴 <span className="text-red-500">*</span>
          </label>
          <Textarea {...register('chiefComplaint')} placeholder="飼主描述的症狀及主訴..." rows={3} />
          {errors.chiefComplaint && (
            <p className="text-xs text-red-500 mt-1">{errors.chiefComplaint.message}</p>
          )}
        </div>

        {/* Diagnosis */}
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">
            診斷 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_DIAGNOSES.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => handleDiagnosisChip(d)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full font-medium border transition-colors',
                  diagnosis === d
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-t border-border-t hover:border-primary hover:text-primary'
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <Input {...register('diagnosis')} placeholder="或手動輸入診斷..." />
          {errors.diagnosis && (
            <p className="text-xs text-red-500 mt-1">{errors.diagnosis.message}</p>
          )}
        </div>

        {/* Clinical findings */}
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">臨床發現</label>
          <Textarea {...register('clinicalFindings')} placeholder="觸診、聽診、視診等臨床發現..." rows={2} />
        </div>

        {/* Treatment */}
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">處置方式</label>
          <Textarea {...register('treatment')} placeholder="本次處置及建議..." rows={2} />
        </div>

        {/* Prescriptions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-ink">用藥</label>
            <button
              type="button"
              onClick={() => addRx({ medicine: '', dosage: '', frequency: '', days: 7 })}
              className="flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-2.5 py-1 hover:bg-primary-bg transition-colors"
            >
              <Plus size={12} />
              新增用藥
            </button>
          </div>

          {rxFields.length === 0 ? (
            <p className="text-xs text-slate-t bg-surface rounded-xl px-3 py-3 text-center">
              點擊「新增用藥」新增處方
            </p>
          ) : (
            <div className="space-y-3">
              {rxFields.map((field, i) => (
                <div key={field.id} className="bg-surface rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="flex-1 h-9 rounded-lg border border-border-t bg-white text-sm px-2 focus:outline-none focus:border-primary"
                      onChange={e => handleMedicineSelect(i, e.target.value)}
                    >
                      <option value="">選擇常用藥品</option>
                      {COMMON_MEDICINES.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <Input
                      {...register(`prescriptions.${i}.medicine`)}
                      placeholder="或輸入藥品名"
                      className="flex-1 h-9"
                    />
                    <button type="button" onClick={() => removeRx(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input {...register(`prescriptions.${i}.dosage`)} placeholder="劑量" className="h-8 text-sm" />
                    <Input {...register(`prescriptions.${i}.frequency`)} placeholder="頻率" className="h-8 text-sm" />
                    <Input
                      {...register(`prescriptions.${i}.days`, { valueAsNumber: true })}
                      type="number"
                      placeholder="天數"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">醫囑備注</label>
          <Textarea {...register('notes')} placeholder="飼主注意事項、飲食建議等..." rows={2} />
        </div>

        {/* Fee */}
        <div>
          <label className="text-sm font-semibold text-ink block mb-1.5">本次費用（元）</label>
          <Input {...register('fee', { valueAsNumber: true })} type="number" className="w-32" />
        </div>

        {/* Follow-up */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('needsFollowUp')}
              className="w-4 h-4 rounded border-border-t accent-primary"
            />
            <span className="text-sm font-semibold text-ink">需要回診</span>
          </label>
          {needsFollowUp && (
            <div className="mt-2">
              <Input {...register('followUpDate')} type="date" className="w-48" />
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="border-t border-border-t p-4 flex gap-3 bg-white flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(true)}
          className="flex-1 border-border-t"
        >
          預覽藥單
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold"
        >
          {submitting ? '處理中...' : '完成看診，通知取件 ✓'}
        </Button>
      </div>

      <PrescriptionPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        data={watchedData}
        patient={inProgress}
      />
    </form>
  )
}

interface PreviewProps {
  open: boolean
  onClose: () => void
  data: Partial<FormValues>
  patient: QueueItem | null
}

function PrescriptionPreviewModal({ open, onClose, data, patient }: PreviewProps) {
  const today = new Date().toLocaleDateString('zh-TW')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>藥單預覽</DialogTitle>
        </DialogHeader>
        <div className="bg-surface rounded-xl p-4 font-mono text-sm space-y-1 border border-border-t">
          <p className="text-center font-bold text-base border-b border-border-t pb-2 mb-2">
            TerryMon 動物醫院 · 獸醫看診藥單
          </p>
          <p>飼主：{patient?.memberName}</p>
          <p>寵物：{patient?.petName}（{patient?.petBreed}）</p>
          <p>日期：{today}</p>
          <p className="border-t border-border-t pt-1 mt-1">
            診斷：{data.diagnosis || '—'}
          </p>
          {data.prescriptions && data.prescriptions.length > 0 && (
            <>
              <p className="border-t border-border-t pt-1 mt-1">用藥：</p>
              {data.prescriptions.map((rx, i) => rx.medicine ? (
                <div key={i} className="pl-2 text-xs">
                  <p>{i + 1}. {rx.medicine}　{rx.dosage}　{rx.frequency}　{rx.days} 天</p>
                </div>
              ) : null)}
            </>
          )}
          {data.notes && (
            <p className="border-t border-border-t pt-1 mt-1 text-xs">
              醫囑：{data.notes}
            </p>
          )}
          {data.needsFollowUp && data.followUpDate && (
            <p className="text-xs">回診：{data.followUpDate}</p>
          )}
          <p className="border-t border-border-t pt-1 mt-1">
            費用：NT$ {(data.fee ?? 0).toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-slate-t text-center mt-2">
          正式版將產生 PDF，傳送至客戶 App
        </p>
      </DialogContent>
    </Dialog>
  )
}
