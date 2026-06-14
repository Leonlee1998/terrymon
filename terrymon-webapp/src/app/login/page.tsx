'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,18}[a-z0-9]$/

const loginSchema = z.object({
  email: z.string().email('請輸入正確的 Email'),
  password: z.string().min(6, '密碼至少 6 碼'),
})
type LoginData = z.infer<typeof loginSchema>

const registerSchema = z.object({
  name: z.string().min(2, '姓名至少 2 個字'),
  phone: z.string().min(10, '請輸入手機號碼'),
  email: z.string().email('請輸入正確的 Email'),
  password: z.string().min(6, '密碼至少 6 碼'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '兩次輸入的密碼不一致',
  path: ['confirmPassword'],
})
type RegisterData = z.infer<typeof registerSchema>

type HandleState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
type RegisterStep = 'account' | 'handle'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [registerStep, setRegisterStep] = useState<RegisterStep>('account')
  const [pendingRegister, setPendingRegister] = useState<RegisterData | null>(null)
  const [handle, setHandle] = useState('')
  const [handleState, setHandleState] = useState<HandleState>('idle')
  const { setMember } = useAuthStore()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const {
    register: regField,
    handleSubmit: regSubmit,
    reset: regReset,
    formState: { errors: regErrors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', phone: '', email: '', password: '', confirmPassword: '' },
  })

  const handleHint = useMemo(() => {
    if (handleState === 'checking') return { text: '檢查中...', color: 'text-slate-t', icon: Loader2 }
    if (handleState === 'available') return { text: '這個會員 ID 可以使用', color: 'text-green-600', icon: CheckCircle2 }
    if (handleState === 'taken') return { text: '這個會員 ID 已被使用', color: 'text-red-500', icon: XCircle }
    if (handleState === 'invalid') return { text: '需 4-20 碼，可用小寫英文、數字與連字號，且首尾不可為連字號', color: 'text-red-500', icon: XCircle }
    return null
  }, [handleState])
  const HandleHintIcon = handleHint?.icon

  useEffect(() => {
    if (registerStep !== 'handle') return
    if (!handle || !HANDLE_RE.test(handle)) return

    let ignore = false
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/handle/check?q=${encodeURIComponent(handle)}`)
        const payload = await response.json() as { available?: boolean }
        if (!ignore) setHandleState(payload.available ? 'available' : 'taken')
      } catch {
        if (!ignore) setHandleState('taken')
      }
    }, 450)

    return () => {
      ignore = true
      window.clearTimeout(timer)
    }
  }, [handle, registerStep])

  async function onLogin(data: LoginData) {
    setLoading(true)
    try {
      const member = await api.login(data.email, data.password)
      setMember(member)
      toast.success(`歡迎回來，${member.name}`)
      router.replace('/')
    } catch {
      toast.error('登入失敗，請確認帳號或密碼')
    } finally {
      setLoading(false)
    }
  }

  function onRegisterAccount(data: RegisterData) {
    setPendingRegister(data)
    setRegisterStep('handle')
    const digits = data.phone.replace(/\D/g, '').slice(-8)
    const suggestedHandle = digits ? `tm-${digits}` : ''
    setHandle(suggestedHandle)
    setHandleState(suggestedHandle ? 'checking' : 'idle')
  }

  async function completeRegister() {
    if (!pendingRegister || handleState !== 'available') return

    setRegLoading(true)
    try {
      const member = await api.register({
        name: pendingRegister.name.trim(),
        phone: pendingRegister.phone.trim(),
        email: pendingRegister.email.trim(),
        password: pendingRegister.password,
        handle,
      })
      setMember(member)
      closeRegister()
      toast.success(`歡迎加入 TerryMon，${member.name}`)
      router.replace('/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '註冊失敗，請稍後再試')
    } finally {
      setRegLoading(false)
    }
  }

  function openRegister() {
    regReset()
    setPendingRegister(null)
    setRegisterStep('account')
    setHandle('')
    setHandleState('idle')
    setRegisterOpen(true)
  }

  function closeRegister() {
    setRegisterOpen(false)
    regReset()
    setPendingRegister(null)
    setRegisterStep('account')
    setHandle('')
    setHandleState('idle')
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
        <div className="mb-10 text-center">
          <Image
            src="/assets/logo.png"
            alt="TerryMon"
            width={180}
            height={60}
            className="mx-auto mb-3 object-contain"
            priority
          />
          <p className="text-sm text-slate-t">寵物健康、醫療與生活服務平台</p>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-2xl font-bold text-ink">會員登入</h1>

          <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
            <div>
              <Input {...register('email')} type="email" placeholder="Email" className="h-12" disabled={loading} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="密碼"
                  className="h-12 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(value => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-t"
                  aria-label={showPw ? '隱藏密碼' : '顯示密碼'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="h-12 w-full bg-primary text-base font-semibold text-white hover:bg-primary-hover">
              {loading ? <Loader2 size={20} className="animate-spin" /> : '登入'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-t">
            還沒有帳號？
            <button onClick={openRegister} className="ml-1 font-medium text-primary">
              建立會員
            </button>
          </p>
        </div>
      </div>

      <Dialog open={registerOpen} onOpenChange={(open) => open ? setRegisterOpen(true) : closeRegister()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{registerStep === 'account' ? '建立會員帳號' : '設定會員 ID'}</DialogTitle>
          </DialogHeader>

          {registerStep === 'account' ? (
            <form onSubmit={regSubmit(onRegisterAccount)} className="mt-2 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">姓名 *</label>
                <Input {...regField('name')} placeholder="王小明" disabled={regLoading} />
                {regErrors.name && <p className="mt-1 text-xs text-red-500">{regErrors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">手機 *</label>
                <Input {...regField('phone')} placeholder="0912-345-678" type="tel" disabled={regLoading} />
                {regErrors.phone && <p className="mt-1 text-xs text-red-500">{regErrors.phone.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Email *</label>
                <Input {...regField('email')} type="email" placeholder="name@email.com" disabled={regLoading} />
                {regErrors.email && <p className="mt-1 text-xs text-red-500">{regErrors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">密碼 *</label>
                <Input {...regField('password')} type="password" placeholder="至少 6 碼" disabled={regLoading} />
                {regErrors.password && <p className="mt-1 text-xs text-red-500">{regErrors.password.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">確認密碼 *</label>
                <Input {...regField('confirmPassword')} type="password" placeholder="再次輸入密碼" disabled={regLoading} />
                {regErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{regErrors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="h-12 w-full bg-primary font-semibold text-white hover:bg-primary-hover">
                下一步
              </Button>
            </form>
          ) : (
            <div className="mt-2 space-y-4">
              <div className="rounded-xl bg-primary-bg px-4 py-3 text-sm leading-6 text-slate-t">
                會員 ID 會用於條碼、店內報到與會員識別。設定後不建議頻繁修改。
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink">會員 ID *</label>
                <div className="flex items-center gap-2 rounded-xl border border-border-t bg-white px-3 py-2 focus-within:border-primary">
                  <span className="shrink-0 text-sm font-bold text-primary">TM-</span>
                  <Input
                    value={handle}
                    onChange={event => {
                      const value = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      setHandle(value)
                      setHandleState(!value ? 'idle' : HANDLE_RE.test(value) ? 'checking' : 'invalid')
                    }}
                    placeholder="your-id"
                    maxLength={20}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="border-0 p-0 font-bold shadow-none focus-visible:ring-0"
                  />
                </div>
                {handleHint && (
                  <p className={`mt-1 flex items-center gap-1.5 text-xs ${handleHint.color}`}>
                    {HandleHintIcon && <HandleHintIcon size={14} className={handleState === 'checking' ? 'animate-spin' : ''} />}
                    {handleHint.text}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setRegisterStep('account')} disabled={regLoading}>
                  上一步
                </Button>
                <Button
                  type="button"
                  onClick={completeRegister}
                  disabled={regLoading || handleState !== 'available'}
                  className="flex-1 bg-primary font-semibold text-white hover:bg-primary-hover"
                >
                  {regLoading ? <Loader2 size={20} className="animate-spin" /> : '完成註冊'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
