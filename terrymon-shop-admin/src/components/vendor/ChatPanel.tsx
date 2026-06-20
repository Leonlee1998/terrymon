'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

type Message = {
  id: string
  sender_id: string | null
  sender_store_id: string | null
  content_type: string
  content: string
  created_at: string
}

interface Props {
  convId: string
  memberName: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPanel({ convId, memberName }: Props) {
  const [msgs, setMsgs]     = useState<Message[]>([])
  const [input, setInput]   = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadMsgs = useCallback(async () => {
    const res = await fetch(`/api/vendor/messages/${convId}`)
    if (!res.ok) return
    const data = await res.json()
    setMsgs(data)
  }, [convId])

  useEffect(() => {
    setMsgs([])
    setInput('')
    loadMsgs()
    intervalRef.current = setInterval(loadMsgs, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [convId, loadMsgs])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    const res = await fetch(`/api/vendor/messages/${convId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
    if (!res.ok) { toast.error('發送失敗'); setInput(text) }
    else { const msg = await res.json(); setMsgs(prev => [...prev, msg]) }
    setSending(false)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border-t bg-white shrink-0">
        <p className="font-semibold text-ink">{memberName}</p>
        <p className="text-xs text-slate-400 mt-0.5">顧客對話</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface">
        {msgs.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">尚無訊息，等待顧客提問</p>
        )}
        {msgs.map(msg => {
          const isStore = !!msg.sender_store_id
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isStore ? 'justify-end' : 'justify-start'}`}>
              {!isStore && (
                <div className="size-8 rounded-full bg-primary-bg border border-border-t flex items-center justify-center text-primary font-bold text-xs shrink-0 mb-1">
                  {memberName.slice(0, 1)}
                </div>
              )}
              <div className={`max-w-[68%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                isStore
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-white text-ink border border-border-t rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isStore ? 'text-white/60' : 'text-slate-400'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-border-t bg-white shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="輸入回覆... (Enter 送出)"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border-t bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary/60 leading-relaxed"
          style={{ maxHeight: '8rem' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity active:scale-95"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
