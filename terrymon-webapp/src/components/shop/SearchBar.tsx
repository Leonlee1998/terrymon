'use client'

import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="搜尋鮮食、保健品、玩具..."
        className="h-12 w-full rounded-2xl border border-[#e9ded2] bg-white/95 pl-11 pr-11 text-[15px] text-ink shadow-sm shadow-[#f0b66a]/10 outline-none transition placeholder:text-[#9b8f82] focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-[#f7efe6] text-slate-t transition hover:bg-[#f0dfcd]"
        >
          <X size={15} />
          <span className="sr-only">清除搜尋</span>
        </button>
      )}
    </div>
  )
}
