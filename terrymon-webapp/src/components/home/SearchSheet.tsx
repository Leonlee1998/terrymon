'use client'
import { useState, useEffect, useMemo } from 'react'
import { Search, CalendarDays, Scissors, Stethoscope, Cake, NotebookPen } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useCalendarEvents, type CalEventType } from '@/hooks/useCalendarEvents'
import { formatDate } from '@/lib/utils'

const FILTERS: { key: CalEventType | 'all'; label: string }[] = [
  { key: 'all',         label: '全部' },
  { key: 'appointment', label: '預約' },
  { key: 'grooming',    label: '美容' },
  { key: 'medical',     label: '醫療' },
  { key: 'birthday',    label: '生日' },
  { key: 'custom',      label: '自訂' },
]

const TYPE_ICON: Record<CalEventType, React.ElementType> = {
  appointment: CalendarDays,
  grooming:    Scissors,
  medical:     Stethoscope,
  birthday:    Cake,
  custom:      NotebookPen,
}

const TYPE_COLOR: Record<CalEventType, string> = {
  appointment: 'text-blue-500',
  grooming:    'text-accent',
  medical:     'text-primary',
  birthday:    'text-pink-500',
  custom:      'text-violet-500',
}

interface Props { open: boolean; onOpenChange: (v: boolean) => void }

export default function SearchSheet({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CalEventType | 'all'>('all')
  const { events, loading, load } = useCalendarEvents()

  useEffect(() => { if (open) load() }, [open, load])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setQuery('')
    onOpenChange(nextOpen)
  }

  const results = useMemo(() => {
    let list = filter === 'all' ? events : events.filter(e => e.type === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.petName.toLowerCase().includes(q) ||
        (e.detail?.toLowerCase().includes(q) ?? false)
      )
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [events, query, filter])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full max-w-sm flex flex-col gap-0">
        <SheetHeader><SheetTitle>快速查詢</SheetTitle></SheetHeader>

        <div className="mt-4 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t pointer-events-none" />
          <Input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="搜尋紀錄、預約、事件…" className="pl-8" autoFocus />
        </div>

        <div className="flex gap-1.5 mt-3 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filter === f.key ? 'bg-primary text-white' : 'bg-surface text-slate-t hover:bg-border-t'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pb-4">
          {loading && <p className="text-sm text-slate-t text-center py-10">載入中…</p>}

          {!loading && results.length === 0 && (
            <p className="text-sm text-slate-t text-center py-10">
              {query ? '找不到相關紀錄' : '目前沒有事件'}
            </p>
          )}

          {results.map(event => {
            const Icon = TYPE_ICON[event.type]
            return (
              <div key={event.id} className="flex items-start gap-3 rounded-xl border border-border-t bg-white p-3">
                <Icon size={15} className={`mt-0.5 shrink-0 ${TYPE_COLOR[event.type]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-ink">{event.title}</p>
                    <p className="text-[11px] text-slate-t shrink-0">{formatDate(event.date)}</p>
                  </div>
                  <p className="text-xs text-slate-t mt-0.5">{event.petName}{event.detail ? ` · ${event.detail}` : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
