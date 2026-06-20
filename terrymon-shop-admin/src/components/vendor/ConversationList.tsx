'use client'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConvItem = {
  id: string
  member_name: string
  member_phone: string
  last_content: string | null
  last_content_type: string | null
  last_at: string
  has_unread: boolean
}

interface Props {
  convs: ConvItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading: boolean
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '剛才'
  if (mins < 60) return `${mins} 分鐘前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} 小時前`
  return `${Math.floor(hrs / 24)} 天前`
}

function previewContent(item: ConvItem) {
  if (!item.last_content) return '尚未有訊息'
  if (item.last_content_type === 'appointment') return '📅 預約申請'
  return item.last_content.length > 30
    ? item.last_content.slice(0, 30) + '...'
    : item.last_content
}

export default function ConversationList({ convs, selectedId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        載入中...
      </div>
    )
  }

  if (!convs.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <MessageCircle size={36} strokeWidth={1.5} />
        <p className="text-sm">尚無顧客訊息</p>
        <p className="text-xs text-center px-4">顧客在商城詢問商品後，<br />對話會出現在這裡</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border-t">
      {convs.map(c => (
        <li key={c.id}>
          <button
            onClick={() => onSelect(c.id)}
            className={cn(
              'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface',
              selectedId === c.id && 'bg-primary-bg'
            )}
          >
            <div className="size-10 rounded-full bg-primary-bg border border-border-t flex items-center justify-center text-primary font-bold text-sm shrink-0 mt-0.5">
              {c.member_name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={cn('text-sm font-semibold truncate', selectedId === c.id ? 'text-primary' : 'text-ink')}>
                  {c.member_name}
                </p>
                <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(c.last_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {c.has_unread && <span className="size-1.5 rounded-full bg-primary shrink-0" />}
                <p className={cn('text-xs truncate', c.has_unread ? 'text-ink font-medium' : 'text-slate-400')}>
                  {previewContent(c)}
                </p>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
