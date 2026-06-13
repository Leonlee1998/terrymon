'use client'
import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAdminStore } from '@/stores/adminStore'
import { WEIGHT_RANGES } from '@/lib/mock'
import { toast } from 'sonner'
import type { GroomingService, ServicePriceMatrix, CoatLength } from '@/types'

const COAT_OPTIONS: { value: CoatLength; label: string }[] = [
  { value: 'short',  label: '短毛' },
  { value: 'medium', label: '中毛' },
  { value: 'long',   label: '長毛' },
  { value: 'double', label: '雙層毛' },
  { value: 'wire',   label: '鋼毛' },
]

interface Props {
  open: boolean
  service: GroomingService | null
  defaultCategory: 'main' | 'addon' | 'package'
  onClose: () => void
}

type FormValues = {
  name: string
  description: string
  category: 'main' | 'addon' | 'package'
  priceMatrix: ServicePriceMatrix[]
  packageMainServiceId?: string
  packageAddonIds: string[]
  packageDiscountPct?: number
}

export default function ServiceEditDialog({ open, service, defaultCategory, onClose }: Props) {
  const { services, addService, updateService } = useAdminStore()
  const isEdit = !!service

  const { register, handleSubmit, watch, control, reset } = useForm<FormValues>({
    defaultValues: {
      name: '', description: '', category: defaultCategory,
      priceMatrix: [], packageAddonIds: [], packageDiscountPct: 10,
    },
  })

  const { fields: matrixFields, append: addMatrix, remove: removeMatrix } = useFieldArray({
    control, name: 'priceMatrix',
  })

  const watchedCategory = watch('category')

  useEffect(() => {
    if (!open) return
    if (service) {
      reset({
        name: service.name,
        description: service.description,
        category: service.category,
        priceMatrix: service.priceMatrix,
        packageMainServiceId: service.packageMainServiceId,
        packageAddonIds: service.packageAddonIds ?? [],
        packageDiscountPct: service.packageDiscountPct,
      })
    } else {
      reset({ name: '', description: '', category: defaultCategory, priceMatrix: [], packageAddonIds: [], packageDiscountPct: 10 })
    }
  }, [open, service, defaultCategory, reset])

  function addMatrixRow() {
    addMatrix({
      weightRangeId: 'xs', coatLength: 'short',
      regularPrice: 0, memberPrice: 0, balancePrice: 0, durationMin: 60,
    })
  }

  function onSubmit(data: FormValues) {
    const payload: GroomingService = {
      id: service?.id ?? `SV${Date.now()}`,
      storeId: 'S001',
      name: data.name,
      description: data.description,
      category: data.category,
      isEnabled: service?.isEnabled ?? true,
      priceMatrix: data.priceMatrix.map(m => ({
        ...m,
        regularPrice: Number(m.regularPrice),
        memberPrice:  Number(m.memberPrice),
        balancePrice: Number(m.balancePrice),
        durationMin:  Number(m.durationMin),
      })),
      applicableSpecies: ['dog', 'cat'],
      sortOrder: service?.sortOrder ?? 99,
      packageMainServiceId: data.category === 'package' ? data.packageMainServiceId : undefined,
      packageAddonIds:      data.category === 'package' ? data.packageAddonIds      : undefined,
      packageDiscountPct:   data.category === 'package' ? Number(data.packageDiscountPct) : undefined,
      createdAt: service?.createdAt ?? new Date().toISOString(),
    }
    if (isEdit) { updateService(payload); toast.success('服務已更新') }
    else         { addService(payload);    toast.success('服務已新增') }
    onClose()
  }

  const mainServices  = services.filter(s => s.category === 'main')
  const addonServices = services.filter(s => s.category === 'addon')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? '編輯服務' : '新增服務'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-ink">服務名稱 *</label>
              <Input {...register('name')} className="mt-1" placeholder="如：洗澡＋剪毛" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-ink">說明</label>
              <Textarea {...register('description')} className="mt-1" rows={2} />
            </div>
          </div>

          {watchedCategory === 'package' && (
            <div className="bg-primary-bg rounded-xl p-4 space-y-3">
              <p className="font-semibold text-sm text-ink">套組設定</p>
              <div>
                <label className="text-xs text-slate-t">主要服務</label>
                <select {...register('packageMainServiceId')}
                  className="w-full mt-1 h-9 rounded-lg border border-border-t bg-white text-sm px-2">
                  <option value="">選擇主要服務</option>
                  {mainServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-t mb-1 block">包含的加值服務（可複選）</label>
                <div className="space-y-1">
                  {addonServices.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        value={s.id}
                        {...register('packageAddonIds')}
                        className="accent-primary"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-t">套組折扣（%，輸入10代表九折）</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input {...register('packageDiscountPct')} type="number" min="0" max="50" className="w-24" />
                  <span className="text-sm text-slate-t">% 折扣</span>
                </div>
              </div>
            </div>
          )}

          {watchedCategory !== 'package' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-ink">定價矩陣</label>
                <button type="button" onClick={addMatrixRow}
                  className="flex items-center gap-1 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary-bg">
                  <Plus size={12} />
                  新增定價
                </button>
              </div>

              {matrixFields.length === 0 ? (
                <p className="text-center text-slate-t text-sm py-4 bg-surface rounded-xl">
                  點擊「新增定價」設定各體型的價格
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-t font-semibold px-1">
                    <span>體型</span><span>毛長</span>
                    <span>一般價</span><span>會員價</span><span>儲值價</span>
                    <span>時長(min)</span><span></span>
                  </div>
                  {matrixFields.map((field, i) => {
                    return (
                      <div key={field.id} className="grid grid-cols-7 gap-1 items-center bg-surface rounded-xl p-2">
                        <select {...register(`priceMatrix.${i}.weightRangeId`)}
                          className="h-8 rounded-lg border border-border-t bg-white text-xs px-1">
                          {WEIGHT_RANGES.map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                          ))}
                        </select>
                        <select {...register(`priceMatrix.${i}.coatLength`)}
                          className="h-8 rounded-lg border border-border-t bg-white text-xs px-1">
                          {COAT_OPTIONS.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <Input {...register(`priceMatrix.${i}.regularPrice`)} type="number" className="h-8 text-xs" />
                        <Input {...register(`priceMatrix.${i}.memberPrice`)}  type="number" className="h-8 text-xs" />
                        <Input {...register(`priceMatrix.${i}.balancePrice`)} type="number" className="h-8 text-xs" />
                        <Input {...register(`priceMatrix.${i}.durationMin`)}  type="number" className="h-8 text-xs" />
                        <button type="button" onClick={() => removeMatrix(i)} className="text-red-400 hover:text-red-600 flex justify-center">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold">
            {isEdit ? '儲存修改' : '新增服務'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

