'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Phone, RefreshCw } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatTime } from '@/lib/utils'

type Conv = {
  id: string
  member_name: string
  member_phone: string
  last_content: string | null
  last_content_type: string | null
  last_at: string
  has_unread: boolean
}

function preview(content: string | null, type: string | null) {
  if (!content) return '尚無訊息'
  if (type === 'appointment') return '📅 預約申請'
  if (type === 'appointment_update') return '🔔 預約更新'
  return content.length > 40 ? content.slice(0, 40) + '…' : content
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [convs, setConvs]     = useState<Conv[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/messages')
    const data = await res.json() as Conv[]
    setConvs(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // 每 30 秒自動更新
  useEffect(() => {
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  return (
    <div className="p-6 max-w-2xl">
      <AdminPageHeader
        title="訊息中心"
        description="與會員的對話記錄"
        action={
          <button
            onClick={() => { setLoading(true); load() }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            重新整理
          </button>
        }
      />

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">載入中...</p>
      ) : convs.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p>目前沒有任何對話</p>
          <p className="text-xs mt-1">會員預約後會自動建立對話</p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {convs.map(conv => (
            <button
              key={conv.id}
              onClick={() => router.push(`/admin/messages/${conv.id}`)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-all text-left"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">
                {conv.member_name.slice(0, 1)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`text-sm font-semibold truncate ${conv.has_unread ? 'text-white' : 'text-gray-200'}`}>
                    {conv.member_name}
                  </p>
                  <p className="text-[11px] text-gray-500 flex-shrink-0">{formatTime(conv.last_at)}</p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {conv.member_phone && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Phone size={10} />{conv.member_phone}
                    </span>
                  )}
                  <p className={`text-xs truncate flex-1 ${conv.has_unread ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                    {preview(conv.last_content, conv.last_content_type)}
                  </p>
                  {conv.has_unread && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
