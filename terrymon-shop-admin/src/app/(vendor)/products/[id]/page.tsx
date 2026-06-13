'use client'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  name:          z.string().min(1, '必填'),
  category:      z.string().min(1, '必填'),
  subcategory:   z.string().optional(),
  price:         z.number().min(1),
  originalPrice: z.number().optional(),
  cost:          z.number().min(0),
  stock:         z.number().int().min(0),
  description:   z.string().min(10, '至少 10 字'),
  tags:          z.string(),
  status:        z.enum(['active','inactive','sold_out','review']),
})
type F = z.infer<typeof schema>

const CATEGORIES = ['食品', '保健', '清潔', '玩具', '配件', '其他']
const inputCls = 'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus:outline-none focus:border-ring'

export default function ProductEdit() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { products, updateProduct } = useVendorStore()
  const product = products.find(p => p.id === id)

  const { register, handleSubmit, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: product ? {
      name: product.name, category: product.category, subcategory: product.subcategory,
      price: product.price, originalPrice: product.originalPrice, cost: product.cost,
      stock: product.stock, description: product.description,
      tags: product.tags.join(', '), status: product.status,
    } : {},
  })

  if (!product) return (
    <div className="p-6 text-slate-t">商品不存在 <button onClick={() => router.back()} className="text-primary underline">返回</button></div>
  )

  function onSubmit(data: F) {
    updateProduct({
      ...product!,
      name: data.name, category: data.category, subcategory: data.subcategory,
      price: data.price, originalPrice: data.originalPrice, cost: data.cost,
      stock: data.stock, description: data.description,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: data.status, updatedAt: new Date().toISOString(),
    })
    toast.success('商品已更新')
    router.push('/products')
  }

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-t hover:text-primary text-sm mb-4">
        <ChevronLeft size={16} /> 返回商品列表
      </button>
      <h1 className="text-2xl font-black text-ink mb-6">編輯商品</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-2xl border border-border-t p-5 space-y-4">
          <h2 className="font-bold text-ink">基本資訊</h2>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">商品名稱 *</label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">分類 *</label>
              <select {...register('category')} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">子分類</label>
              <Input {...register('subcategory')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">商品說明 *</label>
            <Textarea {...register('description')} rows={4} />
            {errors.description && <p className="text-xs text-error mt-1">{errors.description.message}</p>}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border-t p-5 space-y-4">
          <h2 className="font-bold text-ink">定價與庫存</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">售價 *</label>
              <input {...register('price', { valueAsNumber: true })} type="number" min={1} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">原價</label>
              <input {...register('originalPrice', { valueAsNumber: true })} type="number" min={0} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">成本</label>
              <input {...register('cost', { valueAsNumber: true })} type="number" min={0} className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">庫存數量</label>
              <input {...register('stock', { valueAsNumber: true })} type="number" min={0} className={inputCls} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border-t p-5 space-y-4">
          <h2 className="font-bold text-ink">標籤與狀態</h2>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">標籤（逗號分隔）</label>
            <Input {...register('tags')} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">商品狀態</label>
            <select {...register('status')} className={inputCls}>
              <option value="active">上架</option>
              <option value="inactive">下架</option>
              <option value="sold_out">售完</option>
              <option value="review">審核中</option>
            </select>
          </div>
        </section>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold">
            儲存變更
          </Button>
        </div>
      </form>
    </div>
  )
}
