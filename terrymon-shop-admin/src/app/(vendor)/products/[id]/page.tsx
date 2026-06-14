'use client'

import { useMemo, useState } from 'react'
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

export default function ProductEdit() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { products, updateProduct } = useVendorStore()
  const product = products.find(item => item.id === id)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: product ? {
      name: product.name,
      petSpecies: product.petSpecies ?? 'all',
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      originalPrice: product.originalPrice,
      cost: product.cost,
      stock: product.stock,
      description: product.description,
      tags: product.tags.join(', '),
      status: product.status,
    } : {},
  })

  const petSpecies = (watch('petSpecies') ?? product?.petSpecies ?? 'all') as ProductPetSpecies
  const selectedCategory = watch('category')
  const categoryOptions = useMemo(() => {
    const options = CATEGORY_OPTIONS[petSpecies] ?? CATEGORY_OPTIONS.all
    if (!selectedCategory || options.some(option => option.value === selectedCategory)) return options
    return [{ value: selectedCategory, label: selectedCategory }, ...options]
  }, [petSpecies, selectedCategory])

  if (!product) {
    return (
      <div className="p-6 text-slate-t">
        找不到商品。
        <button onClick={() => router.back()} className="ml-2 text-primary underline">返回</button>
      </div>
    )
  }

  const speciesField = register('petSpecies')

  function handleSpeciesChange(event: React.ChangeEvent<HTMLSelectElement>) {
    speciesField.onChange(event)
    setValue('category', '')
  }

  async function onSubmit(data: ProductForm) {
    setLoading(true)
    try {
      await updateProduct(product!.id, {
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
      toast.success('商品已更新')
      router.push('/products')
    } catch {
      toast.error('更新商品失敗')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl p-6">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-slate-t hover:text-primary">
        <ChevronLeft size={16} /> 返回商品列表
      </button>
      <h1 className="mb-6 text-2xl font-black text-ink">編輯商品</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-border-t bg-white p-5">
          <h2 className="font-bold text-ink">基本資料</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">商品名稱 *</label>
            <Input {...register('name')} />
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
              <Input {...register('subcategory')} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">商品描述 *</label>
            <Textarea {...register('description')} rows={4} />
            {errors.description && <p className="mt-1 text-xs text-error">{errors.description.message}</p>}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border-t bg-white p-5">
          <h2 className="font-bold text-ink">價格與庫存</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">售價 *</label>
              <input {...register('price', { valueAsNumber: true })} type="number" min={1} className={inputCls} />
              {errors.price && <p className="mt-1 text-xs text-error">{errors.price.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">原價</label>
              <input
                {...register('originalPrice', { setValueAs: value => value === '' ? undefined : Number(value) })}
                type="number"
                min={0}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">成本</label>
              <input {...register('cost', { valueAsNumber: true })} type="number" min={0} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">庫存</label>
              <input {...register('stock', { valueAsNumber: true })} type="number" min={0} className={inputCls} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border-t bg-white p-5">
          <h2 className="font-bold text-ink">標籤與狀態</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">標籤，以逗號分隔</label>
            <Input {...register('tags')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">商品狀態</label>
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
          <Button type="submit" disabled={loading} className="flex-1 bg-primary font-bold text-white hover:bg-primary-hover">
            {loading ? '更新中...' : '更新商品'}
          </Button>
        </div>
      </form>
    </div>
  )
}
