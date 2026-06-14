'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORY_OPTIONS, PET_SPECIES_OPTIONS, type ProductPetSpecies } from '@/lib/shopFilters'

const schema = z.object({
  name: z.string().min(1, '請輸入商品名稱'),
  petSpecies: z.enum(['all', 'dog', 'cat', 'small_pet', 'bird', 'fish']),
  category: z.string().min(1, '請選擇商品分類'),
  subcategory: z.string().optional(),
  price: z.number().min(1, '售價必須大於 0'),
  originalPrice: z.number().optional(),
  cost: z.number().min(0),
  stock: z.number().int().min(0),
  description: z.string().min(10, '商品描述至少 10 個字'),
  tags: z.string(),
  status: z.enum(['active', 'inactive', 'sold_out', 'review']),
})

type ProductForm = z.infer<typeof schema>

const inputCls = 'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus:outline-none focus:border-ring'

export default function ProductNew() {
  const router = useRouter()
  const { addProduct } = useVendorStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      petSpecies: 'all',
      category: '',
      status: 'active',
      tags: '',
      stock: 0,
      cost: 0,
    },
  })

  const petSpecies = watch('petSpecies') as ProductPetSpecies
  const categoryOptions = useMemo(() => CATEGORY_OPTIONS[petSpecies] ?? CATEGORY_OPTIONS.all, [petSpecies])

  async function onSubmit(data: ProductForm) {
    setLoading(true)
    try {
      await addProduct({
        name: data.name,
        petSpecies: data.petSpecies,
        category: data.category,
        subcategory: data.subcategory,
        price: data.price,
        originalPrice: data.originalPrice,
        cost: data.cost,
        stock: data.stock,
        description: data.description,
        status: data.status,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      })
      toast.success('商品已建立')
      router.push('/products')
    } catch {
      toast.error('建立商品失敗，請稍後再試')
      setLoading(false)
    }
  }

  const speciesField = register('petSpecies')

  function handleSpeciesChange(event: React.ChangeEvent<HTMLSelectElement>) {
    speciesField.onChange(event)
    setValue('category', '')
  }

  return (
    <div className="max-w-2xl p-6">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-slate-t hover:text-primary">
        <ChevronLeft size={16} /> 返回商品列表
      </button>
      <h1 className="mb-6 text-2xl font-black text-ink">新增商品</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border-t bg-white p-5">
          <h2 className="font-bold text-ink">基本資料</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">商品名稱 *</label>
            <Input {...register('name')} placeholder="例如：鮭魚低敏飼料 2kg" />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">寵物種類 *</label>
              <select {...speciesField} onChange={handleSpeciesChange} className={inputCls}>
                {PET_SPECIES_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">商品分類 *</label>
              <select {...register('category')} className={inputCls}>
                <option value="">選擇分類</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-error">{errors.category.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-ink">子分類</label>
              <Input {...register('subcategory')} placeholder="例如：幼犬、成貓、外出用品" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">商品描述 *</label>
            <Textarea {...register('description')} placeholder="說明商品特色、適用對象、規格或注意事項" rows={4} />
            {errors.description && <p className="mt-1 text-xs text-error">{errors.description.message}</p>}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border-t bg-white p-5">
          <h2 className="font-bold text-ink">價格與庫存</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">售價 *</label>
              <input {...register('price', { valueAsNumber: true })} type="number" min={1} className={inputCls} placeholder="890" />
              {errors.price && <p className="mt-1 text-xs text-error">{errors.price.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">原價</label>
              <input
                {...register('originalPrice', { setValueAs: value => value === '' ? undefined : Number(value) })}
                type="number"
                min={0}
                className={inputCls}
                placeholder="990"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">成本</label>
              <input {...register('cost', { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="450" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">庫存</label>
              <input {...register('stock', { valueAsNumber: true })} type="number" min={0} className={inputCls} placeholder="100" />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border-t bg-white p-5">
          <h2 className="font-bold text-ink">標籤與狀態</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">標籤，以逗號分隔</label>
            <Input {...register('tags')} placeholder="低敏, 鮭魚, 幼犬" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">商品狀態</label>
            <select {...register('status')} className={inputCls}>
              <option value="active">上架</option>
              <option value="inactive">下架</option>
              <option value="review">審核中</option>
              <option value="sold_out">售完</option>
            </select>
          </div>
        </section>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-primary font-bold text-white hover:bg-primary-hover">
            {loading ? '建立中...' : '建立商品'}
          </Button>
        </div>
      </form>
    </div>
  )
}
