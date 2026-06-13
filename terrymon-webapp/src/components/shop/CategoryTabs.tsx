'use client'

import { cn } from '@/lib/utils'

const CATEGORIES = ['全部', '食品', '保健品', '清潔', '玩具', '配件']

interface Props {
  active: string
  onChange: (c: string) => void
}

export default function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map(category => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            'h-9 flex-shrink-0 rounded-full px-4 text-sm font-semibold transition-all',
            active === category
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'border border-[#eadfd2] bg-white/85 text-[#77685a] hover:border-primary/40 hover:text-primary'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
