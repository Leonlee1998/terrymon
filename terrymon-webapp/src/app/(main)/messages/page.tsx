'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Scissors, Stethoscope, ShoppingBag, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils'

type ConvRow = {
  id: string
  type: string
  ref_type: string
  ref_id: string
  store_name: string
  store_type: string
  last_content: string | null
  last_content_type: string | null
  last_at: string | null
  unread: number
}

type Filter = 'all' | 'grooming' | 'vet' | 'shop'

const FILTERS: { key: Filter; label: string; icon?: React.ElementType }[] = [
  { key: 'all',      label: '全部' },
  { key: 'grooming', label: '美容',  icon: Scissors },
  { key: 'vet',      label: '獸醫',  icon: Stethoscope },
  { key: 'shop',     label: '商城',  icon: ShoppingBag },
]

const STORE_ICON: Record<string, React.ElementType> = {
  grooming: Scissors,
  vet:      Stethoscope,
  shop:     ShoppingBag,
}

const STORE_ICON_BG: Record<string, string> = {
  grooming: 'bg-primary-bg text-primary',
  vet:      'bg-blue-50 text-blue-600',
  shop:     'bg-orange-50 text-accent',
}

function lastMessagePreview(content: string | null, contentType: string | null): string {
  if (!content) return '開始對話...'
  if (contentType === 'appointment') {
    try {
      const j = JSON.parse(content)
      return `📅 預約申請：${j.pet_name} · ${j.service}`
    } catch {
      return '📅 預約申請'
    }
  }
  return content
}

function categoryFromConv(conv: ConvRow): Filter {
  if (conv.store_type === 'grooming') return 'grooming'
  if (conv.store_type === 'vet') return 'vet'
  if (conv.ref_type === 'vendor' || conv.store_type === 'shop') return 'shop'
  return 'all'
}

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [convs, setConvs]   = useState<ConvRow[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data, error } = await supabase.rpc('get_member_conversations')
    if (error) console.error('[get_member_conversations]', error)
    setConvs((data as ConvRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === 'all'
    ? convs
    : convs.filter(c => categoryFromConv(c) === filter)

  function openChat(conv: ConvRow) {
    const cat = conv.store_type === 'vendor' || conv.ref_type === 'vendor' ? 'shop'
              : conv.store_type ?? conv.type
    router.push(`/messages/${cat}/${conv.ref_id}`)
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-80px)] md:min-h-dvh">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#eadfd2] bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-t hover:text-ink transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-semibold text-ink flex-1">訊息</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-[#eadfd2] bg-white">
        {FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-surface text-slate-t hover:bg-[#eadfd2]'
            }`}
          >
            {Icon && <Icon size={12} />}
            {label}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-t">載入中...</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-6">
            <MessageCircle size={40} className="text-[#d8cfc7] mx-auto mb-3" />
            <p className="font-semibold text-ink mb-1">還沒有訊息</p>
            <p className="text-sm text-slate-t">完成預約後，訊息會自動出現在這裡</p>
          </div>
        ) : (
          filtered.map(conv => {
            const storeType = categoryFromConv(conv)
            const StoreIcon = STORE_ICON[storeType] ?? MessageCircle
            const iconCls   = STORE_ICON_BG[storeType] ?? 'bg-surface text-slate-t'
            const preview   = lastMessagePreview(conv.last_content, conv.last_content_type)
            return (
              <button
                key={conv.id}
                onClick={() => openChat(conv)}
                className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-[#eadfd2] hover:border-primary/30 hover:shadow-sm transition-all text-left"
              >
                {/* Store icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                  <StoreIcon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{conv.store_name}</p>
                    {conv.last_at && (
                      <p className="text-[11px] text-slate-t flex-shrink-0">{formatTime(conv.last_at)}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-ink font-medium' : 'text-slate-t'}`}>
                      {preview}
                    </p>
                    {conv.unread > 0 && (
                      <span className="flex-shrink-0 min-w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {conv.unread > 99 ? '99+' : conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
