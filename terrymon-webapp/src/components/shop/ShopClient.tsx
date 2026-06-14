'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { SlidersHorizontal } from 'lucide-react'
import type { Product } from '@/types'
import { CATEGORY_OPTIONS, PET_SPECIES_OPTIONS, type ProductPetSpecies } from '@/lib/shopFilters'
import SearchBar from './SearchBar'
import CategoryTabs from './CategoryTabs'
import ProductCard from './ProductCard'
import CartFAB from './CartFAB'
import ShopHeader from './ShopHeader'

type SortBy = 'default' | 'price_asc' | 'price_desc' | 'rating'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'default', label: '推薦排序' },
  { value: 'price_asc', label: '價格低到高' },
  { value: 'price_desc', label: '價格高到低' },
  { value: 'rating', label: '評分最高' },
]

interface Props {
  initialProducts: Product[]
}

export default function ShopClient({ initialProducts }: Props) {
  const [search, setSearch] = useState('')
  const [petSpecies, setPetSpecies] = useState<ProductPetSpecies>('all')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortBy>('default')
  const categoryOptions = CATEGORY_OPTIONS[petSpecies]

  const filtered = useMemo(() => {
    let result = initialProducts

    if (petSpecies !== 'all') {
      result = result.filter(product => {
        const species = product.petSpecies ?? 'all'
        return species === petSpecies || species === 'all'
      })
    }

    if (category !== 'all') {
      result = result.filter(product => product.category === category)
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase()
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)

    return result
  }, [initialProducts, petSpecies, category, search, sortBy])

  return (
    <div className="min-h-screen pb-32">
      <ShopHeader />
      <section className="relative overflow-hidden bg-[#fff4df] px-4 pb-5 pt-4 md:px-6 md:pt-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4 rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-sm shadow-[#e6b980]/20 backdrop-blur md:p-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">TerryMon Shop</p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-ink md:text-4xl">
              依照毛孩需要挑選商品
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d6258] md:text-base">
              先選寵物種類，再看主食、保健、清潔或用品分類，幫店家商品和會員購物流程對齊。
            </p>
          </div>
          <div className="hidden shrink-0 sm:block">
            <Image
              src="/assets/terrymon-mascot.png"
              alt="TerryMon mascot"
              width={128}
              height={128}
              className="size-28 rounded-[26px] object-cover md:size-32"
              priority
            />
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-30 border-b border-[#f1deca] bg-[#fff8ed]/95 px-4 py-3 shadow-sm shadow-[#e9cda7]/20 backdrop-blur md:px-6">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="grid gap-2 md:grid-cols-[1fr_190px]">
            <SearchBar value={search} onChange={setSearch} />
            <label className="relative">
              <SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value as SortBy)}
                className="h-12 w-full appearance-none rounded-2xl border border-[#e9ded2] bg-white/95 pl-10 pr-4 text-sm font-semibold text-[#6d6258] shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
          <CategoryTabs
            active={petSpecies}
            options={PET_SPECIES_OPTIONS}
            onChange={(next) => {
              setPetSpecies(next as ProductPetSpecies)
              setCategory('all')
            }}
          />
          <CategoryTabs active={category} options={categoryOptions} onChange={setCategory} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-5 md:px-6">
        {filtered.length === 0 ? (
          <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
            <Image
              src="/assets/terrymon-mascot.png"
              alt="TerryMon mascot"
              width={150}
              height={150}
              className="size-32 rounded-[30px] object-cover"
            />
            <p className="mt-4 font-bold text-ink">目前沒有符合條件的商品</p>
            <p className="mt-1 text-sm leading-6 text-slate-t">可以換個寵物種類、分類或搜尋關鍵字再試一次。</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>

      <CartFAB />
    </div>
  )
}
