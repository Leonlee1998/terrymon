'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { formatTime, formatDate } from '@/lib/utils'

type Message = {
  id: string
  conversation_id: string
  sender_id: string | null        // null 表示 store 發的訊息
  sender_store_id: string | null
  content_type: string
  content: string
  is_deleted: boolean
  created_at: string
}

type ApptPayload = {
  appointment_id: string
  pet_name: string
  service: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'rejected' | 'completed'
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:   { label: '⏳ 待確認', cls: 'text-amber-600 bg-amber-50' },
  confirmed: { label: '✅ 已確認', cls: 'text-green-600 bg-green-50' },
  rejected:  { label: '❌ 已取消', cls: 'text-red-600 bg-red-50' },
  completed: { label: '✔ 已完成', cls: 'text-slate-t bg-surface' },
}

const CATEGORY_META: Record<string, { name: string; icon: string }> = {
  grooming: { name: 'TerryMon 美容', icon: '✂️' },
  vet:      { name: 'TerryMon 獸醫', icon: '🩺' },
  shop:     { name: '商城客服',       icon: '🛍️' },
}

// 預約訊息卡片
function AppointmentCard({ content, isMe }: { content: string; isMe: boolean }) {
  let data: ApptPayload | null = null
  try { data = JSON.parse(content) } catch { return null }
  if (!data) return null

  const status = STATUS_LABEL[data.status] ?? STATUS_LABEL.pending

  return (
    <div className={`rounded-2xl border overflow-hidden w-64 shadow-sm ${isMe ? 'border-white/20' : 'border-[#eadfd2]'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${isMe ? 'bg-white/10' : 'bg-primary-bg'}`}>
        <CalendarDays size={14} className={isMe ? 'text-white/80' : 'text-primary'} />
        <span className={`text-xs font-bold ${isMe ? 'text-white/90' : 'text-primary'}`}>預約申請</span>
      </div>
      <div className={`px-3 py-2.5 space-y-1 ${isMe ? 'bg-primary/80' : 'bg-white'}`}>
        <p className={`text-sm font-bold ${isMe ? 'text-white' : 'text-ink'}`}>{data.pet_name}</p>
        <p className={`text-xs ${isMe ? 'text-white/80' : 'text-slate-t'}`}>{data.service}</p>
        <p className={`text-xs ${isMe ? 'text-white/80' : 'text-slate-t'}`}>
          {formatDate(data.date)} {data.time}
        </p>
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${isMe ? 'bg-white/20 text-white' : status.cls}`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ category: string; storeId: string }>
}) {
  const { category, storeId } = React.use(params)

  const router = useRouter()
  const { member } = useAuthStore()
  const supabase = createClient()

  const [storeName, setStoreName]   = useState('')
  const [convId, setConvId]         = useState<string | null>(null)
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(true)
  const [sending, setSending]       = useState(false)
  const bottomRef                   = useRef<HTMLDivElement>(null)
  const inputRef                    = useRef<HTMLTextAreaElement>(null)

  const icon = CATEGORY_META[category]?.icon ?? '💬'

  // 取得店家名稱
  useEffect(() => {
    async function fetchName() {
      if (category === 'shop') {
        const { data } = await supabase.from('vendors').select('store_name').eq('id', storeId).single()
        setStoreName(data?.store_name ?? '')
      } else {
        const { data } = await supabase.from('stores').select('name').eq('id', storeId).single()
        setStoreName(data?.name ?? '')
      }
    }
    fetchName()
  }, [category, storeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // 取得或建立對話（grooming/vet → ref_type='store'；shop → ref_type='vendor'）
  useEffect(() => {
    if (!member) return
    const refType = category === 'shop' ? 'vendor' : 'store'
    supabase
      .rpc('get_or_create_conversation', {
        p_type:     category,
        p_ref_type: refType,
        p_ref_id:   storeId,
      })
      .then(({ data }) => { if (data) setConvId(data as string) })
  }, [member, category, storeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // 標記已讀 helper
  function markRead(cid: string) {
    if (!member) return
    supabase.from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', cid)
      .eq('member_id', member.id)
      .then()
  }

  // 載入歷史訊息 + Realtime
  useEffect(() => {
    if (!convId) return

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false); markRead(convId) })

    const sub = supabase
      .channel(`chat:${convId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `conversation_id=eq.${convId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
        markRead(convId)
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [convId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || !convId || !member || sending) return
    setSending(true)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id:       member.id,
      content_type:    'text',
      content:         text,
      is_deleted:      false,
    })
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] md:h-dvh bg-[#f5f0eb]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#eadfd2] bg-white flex-shrink-0 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-t hover:text-ink transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-primary-bg flex items-center justify-center text-lg flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink leading-tight truncate">{storeName || '...'}</p>
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-green-500" />
            <p className="text-xs text-slate-t">客服線上</p>
          </div>
        </div>
      </div>

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-t">載入訊息中...</p>
        ) : messages.filter(m => !m.is_deleted).length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-5xl mb-4">{icon}</p>
            <p className="font-semibold text-ink mb-1">{storeName}</p>
            <p className="text-sm text-slate-t">有任何問題歡迎發訊息！</p>
            <p className="text-xs text-slate-t mt-1">客服時間：週一至週六 10:00–19:00</p>
          </div>
        ) : (
          messages
            .filter(m => !m.is_deleted)
            .map(msg => {
              const isMe = msg.sender_id === member?.id
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="size-8 rounded-full bg-primary-bg border border-[#eadfd2] flex items-center justify-center text-base flex-shrink-0 mb-1">
                      {icon}
                    </div>
                  )}
                  {msg.content_type === 'appointment' ? (
                    <AppointmentCard content={msg.content} isMe={isMe} />
                  ) : (
                    <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMe
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white text-ink border border-[#eadfd2] rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-slate-t'}`}>
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
      <div className="flex items-end gap-2 px-4 py-3 border-t border-[#eadfd2] bg-white flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="輸入訊息... (Enter 送出)"
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-[#eadfd2] bg-[#faf8f5] px-4 py-2.5 text-sm outline-none focus:border-primary/60 leading-relaxed overflow-y-auto"
          style={{ maxHeight: '8rem' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending || !convId}
          className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity active:scale-95"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
