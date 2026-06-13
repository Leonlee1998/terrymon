'use client'
/* eslint-disable react-hooks/purity */
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import type { Promotion } from '@/types'

const schema = z.object({
  name:           z.string().min(1, '必填'),
  type:           z.enum(['discount','coupon','bundle']),
  discountValue:  z.number().min(1),
  discountType:   z.enum(['percent','fixed']),
  minOrderAmount: z.number().optional(),
  startDate:      z.string().min(1, '必填'),
  endDate:        z.string().min(1, '必填'),
  usageLimit:     z.number().int().min(1),
})
type F = z.infer<typeof schema>

const inputCls = 'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus:outline-none focus:border-ring'
const TYPE_LABEL: Record<string, string> = { discount: '折扣', coupon: '優惠券', bundle: '組合' }

export default function PromotionsPage() {
  const { promotions, addPromotion, togglePromotion } = useVendorStore()
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'discount', discountType: 'percent', usageLimit: 100 },
  })

  function onSubmit(data: F) {
    const promo: Promotion = {
      id: `PROMO${Date.now()}`, vendorId: 'V001',
      name: data.name, type: data.type,
      discountValue: data.discountValue, discountType: data.discountType,
      minOrderAmount: data.minOrderAmount,
      startDate: data.startDate, endDate: data.endDate,
      usageLimit: data.usageLimit, usedCount: 0, isActive: true,
      applicableProductIds: [],
    }
    addPromotion(promo)
    toast.success('活動已建立')
    reset(); setOpen(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-ink">行銷活動</h1>
        <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary-hover text-white gap-2">
          <Plus size={16} /> 新增活動
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-t bg-surface">
              {['活動名稱', '類型', '折扣', '期間', '已使用/上限', '狀態', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-t">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-t">
            {promotions.map(p => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-slate-t">{TYPE_LABEL[p.type]}</td>
                <td className="px-4 py-3">
                  {p.discountType === 'percent' ? `${p.discountValue}% 折` : `減 NT$${p.discountValue}`}
                </td>
                <td className="px-4 py-3 text-xs text-slate-t">
                  {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
                </td>
                <td className="px-4 py-3 text-slate-t">{p.usedCount} / {p.usageLimit}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => togglePromotion(p.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      p.isActive ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      p.isActive ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toast.info('刪除功能開發中')}
                    className="text-slate-t hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promotions.length === 0 && (
          <div className="py-16 text-center text-slate-t text-sm">尚無行銷活動</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>新增行銷活動</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">活動名稱 *</label>
              <Input {...register('name')} placeholder="618 購物節" />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">類型</label>
                <select {...register('type')} className={inputCls}>
                  <option value="discount">折扣</option>
                  <option value="coupon">優惠券</option>
                  <option value="bundle">組合</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">折扣方式</label>
                <select {...register('discountType')} className={inputCls}>
                  <option value="percent">百分比</option>
                  <option value="fixed">固定金額</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">折扣值 *</label>
                <input {...register('discountValue', { valueAsNumber: true })} type="number" min={1} className={inputCls} placeholder="10" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">最低消費</label>
                <input {...register('minOrderAmount', { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">開始日期 *</label>
                <input {...register('startDate')} type="date" className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-ink mb-1 block">結束日期 *</label>
                <input {...register('endDate')} type="date" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">使用上限 *</label>
              <input {...register('usageLimit', { valueAsNumber: true })} type="number" min={1} className={inputCls} placeholder="100" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary-hover">建立活動</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
