'use client'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import ConversationList, { type ConvItem } from '@/components/vendor/ConversationList'
import ChatPanel from '@/components/vendor/ChatPanel'

export default function MessagesPage() {
  const [convs, setConvs]           = useState<ConvItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vendor/messages')
      .then(r => r.json())
      .then((data: ConvItem[]) => { setConvs(data); setLoading(false) })
      .catch(() => setLoading(false))

    const id = setInterval(() => {
      fetch('/api/vendor/messages')
        .then(r => r.json())
        .then((data: ConvItem[]) => setConvs(data))
        .catch(() => {})
    }, 15000)
    return () => clearInterval(id)
  }, [])

  const selectedConv = convs.find(c => c.id === selectedId) ?? null

  return (
    <div className="flex h-screen bg-white">
      {/* Left: conversation list */}
      <aside className="w-72 shrink-0 border-r border-border-t flex flex-col">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border-t">
          <MessageCircle size={18} className="text-primary" />
          <h1 className="font-semibold text-ink">顧客訊息</h1>
          {convs.length > 0 && (
            <span className="ml-auto text-xs bg-surface text-slate-400 px-2 py-0.5 rounded-full">
              {convs.length}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            convs={convs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
          />
        </div>
      </aside>

      {/* Right: chat panel */}
      <main className="flex-1 min-w-0">
        {selectedConv ? (
          <ChatPanel convId={selectedConv.id} memberName={selectedConv.member_name} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <MessageCircle size={48} strokeWidth={1.2} />
            <p className="text-sm font-medium">選擇左側對話開始回覆</p>
            <p className="text-xs">顧客的詢問都會列在左側</p>
          </div>
        )}
      </main>
    </div>
  )
}
