import { cn } from '@/lib/utils'

interface Props {
  active: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export default function CategoryTabs({ active, options, onChange }: Props) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'h-9 flex-shrink-0 rounded-full px-4 text-sm font-semibold transition-all',
            active === option.value
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'border border-[#eadfd2] bg-white/85 text-[#77685a] hover:border-primary/40 hover:text-primary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
