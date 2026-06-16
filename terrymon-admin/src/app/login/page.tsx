'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const errorParam = params.get('error')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('登入失敗：帳號或密碼錯誤')
      setLoading(false)
      return
    }
    // session 已寫入 cookie，(admin)/layout 會再確認是否為啟用中後台帳號
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-border-t bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-primary">TerryMon 平台後台</h1>
          <p className="mt-1 text-sm text-slate-t">預約怪獸營運管理</p>
        </div>

        {errorParam === 'unauthorized' && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-error">
            此帳號不是啟用中的後台管理員，無法進入。
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="email" placeholder="管理員 Email" value={email} required
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password" placeholder="密碼" value={password} required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登入中…' : '登入'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
