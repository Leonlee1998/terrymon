'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,18}[a-z0-9]$/

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function SetHandlePage() {
  const { member, updateMember, isLoggedIn } = useAuthStore()
  const router = useRouter()
  const [handle, setHandle] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); return }
    if (member?.handle) { router.replace('/'); return }
  }, [isLoggedIn, member, router])

  function onInput(value: string) {
    const v = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setHandle(v)
    setCheckState('idle')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!v) return

    if (!HANDLE_RE.test(v)) { setCheckState('invalid'); return }

    setCheckState('checking')
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/handle/check?q=${encodeURIComponent(v)}`)
      const data = await res.json() as { available: boolean }
      setCheckState(data.available ? 'available' : 'taken')
    }, 500)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (checkState !== 'available' || saving) return
    setSaving(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/handle/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      })
      const data = await res.json() as { handle?: string; error?: string }
      if (!res.ok) { setErrorMsg(data.error ?? '設定失敗'); return }
      updateMember({ handle: data.handle })
      router.replace('/')
    } catch {
      setErrorMsg('網路錯誤，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  const hintMap: Record<CheckState, { icon: React.ReactNode; text: string; color: string } | null> = {
    idle:      null,
    checking:  { icon: <Loader2 size={14} className="animate-spin" />, text: '查詢中…', color: 'text-gray-400' },
    available: { icon: <CheckCircle2 size={14} />, text: '可以使用！', color: 'text-green-600' },
    taken:     { icon: <XCircle size={14} />, text: '已被使用，換一個', color: 'text-red-500' },
    invalid:   { icon: <XCircle size={14} />, text: '4–20 字元，小寫英文 / 數字 / 連字號，不可開頭或結尾為 -', color: 'text-red-500' },
  }
  const hint = hintMap[checkState]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Image src="/assets/logo.png" alt="TerryMon 預約怪獸" width={140} height={47} className="object-contain" />
          <h1 className="text-center text-2xl font-black text-ink">設定你的會員 ID</h1>
          <p className="text-center text-sm text-slate-t">
            這是你的專屬識別碼，設定後<strong>永久不可修改</strong>。<br />
            店家掃描條碼報到時就是用這個 ID。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-border-t bg-white px-4 py-3 focus-within:border-primary">
              <span className="shrink-0 text-sm font-bold text-card-teal">TM-</span>
              <Input
                value={handle}
                onChange={e => onInput(e.target.value)}
                placeholder="your-handle"
                maxLength={20}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="border-0 p-0 text-base font-bold shadow-none focus-visible:ring-0"
              />
            </div>
            {hint && (
              <p className={`flex items-center gap-1.5 text-xs ${hint.color}`}>
                {hint.icon}{hint.text}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-primary-bg px-4 py-3 text-xs text-slate-t space-y-1">
            <p>• 長度 4–20 字元</p>
            <p>• 只能使用小寫英文字母、數字、連字號（-）</p>
            <p>• 不能以連字號開頭或結尾</p>
          </div>

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <Button
            type="submit"
            disabled={checkState !== 'available' || saving}
            className="w-full bg-primary text-white hover:bg-primary-hover"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> 設定中…</> : '確認設定'}
          </Button>
        </form>
      </div>
    </div>
  )
}
