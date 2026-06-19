'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CalendarDays } from 'lucide-react'
import { formatTime, formatDate } from '@/lib/utils'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

type Message = {
  id: string
  conversation_id: string
  sender_id: string | null
  sender_store_id: string | null
  content_type: string
  content: string
  is_deleted: boolean
  created_at: string
}

type ApptPayload = {
  appointment_id?: string
  pet_name?: string
  service?: string
  date?: string
  time?: string
  status?: string
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:   { label: '⏳ 待確認', cls: 'text-amber-400 bg-amber-900/30' },
  confirmed: { label: '✅ 已確認', cls: 'text-green-400 bg-green-900/30' },
  rejected:  { label: '❌ 已取消', cls: 'text-red-400 bg-red-900/30' },
  completed: { label: '✔ 已完成', cls: 'text-gray-400 bg-gray-700/50' },
}

function AppointmentCard({ content, isStore }: { content: string; isStore: boolean }) {
  let data: ApptPayload | null = null
  try { data = JSON.parse(content) } catch { return null }
  if (!data) return null
  const status = STATUS_LABEL[data.status ?? 'pending'] ?? STATUS_LABEL.pending
  return (
    <div className={`rounded-xl border overflow-hidden w-60 ${isStore ? 'border-primary/40' : 'border-gray-600'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${isStore ? 'bg-primary/20' : 'bg-gray-700'}`}>
        <CalendarDays size={13} className={isStore ? 'text-primary' : 'text-gray-300'} />
        <span className={`text-xs font-bold ${isStore ? 'text-primary' : 'text-gray-200'}`}>預約申請</span>
      </div>
      <div className={`px-3 py-2.5 space-y-1 ${isStore ? 'bg-gray-800' : 'bg-gray-750'}`}>
        <p className="text-sm font-bold text-white">{data.pet_name ?? '-'}</p>
        <p className="text-xs text-gray-400">{data.service ?? '-'}</p>
        {data.date && <p className="text-xs text-gray-400">{formatDate(data.date)} {data.time ?? ''}</p>}
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${status.cls}`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

export default function AdminChatPage({
  params,
}: {
  params: Promise<{ convId: string }>
}) {
  const { convId } = React.use(params)
  const router = useRouter()

  const [memberName, setMemberName] = useState('')
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(true)
  const [sending, setSending]       = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const loadMessages = useCallback(async () => {
    const res  = await fetch(`/api/admin/messages/${convId}`)
    const data = await res.json() as Message[]
    setMessages(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [convId])

  // 取會員名稱（從 conversations list 取不到，透過 messages 的 sender 推斷或獨立 fetch）
  useEffect(() => {
    fetch('/api/admin/messages')
      .then(r => r.json())
      .then((list: { id: string; member_name: string }[]) => {
        const conv = list.find(c => c.id === convId)
        if (conv) setMemberName(conv.member_name)
      })
  }, [convId])

  useEffect(() => { loadMessages() }, [loadMessages])

  // 輪詢每 10 秒
  useEffect(() => {
    const t = setInterval(loadMessages, 10_000)
    return () => clearInterval(t)
  }, [loadMessages])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const res = await fetch(`/api/admin/messages/${convId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content: text }),
    })
    if (res.ok) {
      const msg = await res.json() as Message
      setMessages(prev => [...prev, msg])
    }
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-700 bg-gray-900 flex-shrink-0">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
          {memberName ? memberName.slice(0, 1) : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{memberName || '載入中...'}</p>
          <p className="text-xs text-gray-500">會員對話</p>
        </div>
      </div>

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-900">
        {loading ? (
          <p className="py-10 text-center text-sm text-gray-500">載入訊息中...</p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">尚無訊息</p>
        ) : (
          messages.map(msg => {
            const isStore = msg.sender_store_id === STORE_ID || msg.sender_id === null
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isStore ? 'justify-end' : 'justify-start'}`}>
                {!isStore && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0 mb-1">
                    {memberName.slice(0, 1) || '?'}
                  </div>
                )}
                {msg.content_type === 'appointment' ? (
                  <AppointmentCard content={msg.content} isStore={isStore} />
                ) : (
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    isStore
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isStore ? 'text-white/60' : 'text-gray-500'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 輸入區 */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900 flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="輸入回覆訊息… (Enter 送出)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500 px-4 py-2.5 text-sm outline-none focus:border-primary/60 leading-relaxed"
          style={{ maxHeight: '8rem' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="size-10 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity active:scale-95"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
