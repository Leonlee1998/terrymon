'use client'
import { useEffect, useState } from 'react'
import { Scissors, Stethoscope, ShoppingBag, ChevronRight, MapPin } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'

type StoreItem = { id: string; name: string; subtitle: string; category: string }

const TABS = [
  { key: 'grooming', label: '美容', icon: Scissors,     bg: 'bg-primary-bg', color: 'text-primary' },
  { key: 'vet',      label: '獸醫', icon: Stethoscope,  bg: 'bg-blue-50',    color: 'text-blue-600' },
  { key: 'shop',     label: '商城', icon: ShoppingBag,  bg: 'bg-orange-50',  color: 'text-accent' },
] as const

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSelect: (category: string, storeId: string) => void
}

export default function NewConversationSheet({ open, onOpenChange, onSelect }: Props) {
  const supabase = createClient()
  const [tab, setTab] = useState<'grooming' | 'vet' | 'shop'>('grooming')
  const [stores, setStores] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)

    async function load() {
      if (tab === 'grooming' || tab === 'vet') {
        const { data } = await supabase
          .from('stores')
          .select('id, name, address, type')
          .eq('is_active', true)
          .eq('type', tab)
          .order('name')
        setStores(
          (data ?? []).map((s: { id: string; name: string; address: string; type: string }) => ({
            id:       s.id,
            name:     s.name,
            subtitle: s.address ?? '',
            category: tab,
          }))
        )
      } else {
        const { data } = await supabase
          .from('vendors')
          .select('id, store_name, description')
          .eq('status', 'approved')
          .order('store_name')
        setStores(
          (data ?? []).map((v: { id: string; store_name: string; description: string | null }) => ({
            id:       v.id,
            name:     v.store_name,
            subtitle: v.description ?? '寵物精選商品',
            category: 'shop',
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [open, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75dvh] rounded-t-3xl px-0 pb-0">
        <SheetHeader className="px-5 pb-3">
          <SheetTitle>聯絡店家</SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex gap-2 px-5 mb-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === key ? 'bg-primary text-white' : 'bg-surface text-slate-t'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Store list */}
        <div className="flex-1 overflow-y-auto px-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-t">載入中...</p>
          ) : stores.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-t">目前尚無可聯絡的店家</p>
          ) : (
            <ul className="space-y-2 pb-8">
              {stores.map(store => {
                const tabMeta = TABS.find(t => t.key === store.category)!
                const Icon = tabMeta.icon
                return (
                  <li key={store.id}>
                    <button
                      onClick={() => onSelect(store.category, store.id)}
                      className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-[#eadfd2] hover:border-primary/40 hover:shadow-sm transition-all text-left"
                    >
                      <div className={`w-11 h-11 rounded-xl ${tabMeta.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={tabMeta.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink">{store.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-slate-t flex-shrink-0" />
                          <p className="text-xs text-slate-t truncate">{store.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-t flex-shrink-0" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
