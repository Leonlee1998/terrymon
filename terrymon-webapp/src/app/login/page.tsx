'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'

const loginSchema = z.object({
  email:    z.string().email('請輸入有效的電子信箱'),
  password: z.string().min(6, '密碼至少 6 個字元'),
})
type LoginData = z.infer<typeof loginSchema>

const registerSchema = z.object({
  name:            z.string().min(2, '姓名至少 2 個字'),
  phone:           z.string().min(10, '請填寫正確手機號碼'),
  email:           z.string().email('請輸入有效的電子信箱'),
  password:        z.string().min(6, '密碼至少 6 個字元'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: '兩次密碼不一致',
  path: ['confirmPassword'],
})
type RegisterData = z.infer<typeof registerSchema>

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const { setMember } = useAuthStore()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@terrymon.com', password: 'demo1234' },
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

  async function onLogin(data: LoginData) {
    setLoading(true)
    try {
      const member = await api.login(data.email, data.password)
      setMember(member)
      toast.success(`歡迎回來，${member.name}！`)
      router.replace('/')
    } catch {
      toast.error('登入失敗，請檢查帳號密碼')
    } finally {
      setLoading(false)
    }
  }

  async function onRegister(data: RegisterData) {
    setRegLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const member = await api.login('demo@terrymon.com', 'demo1234')
    setMember({
      ...member,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
    })
    setRegLoading(false)
    setRegisterOpen(false)
    regReset()
    toast.success(`歡迎加入 TerryMon，${data.name}！`)
    router.replace('/')
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary to-primary-light flex flex-col items-center justify-center text-white px-8 py-16 flex-1 max-h-[48vh]">
          <div className="text-7xl mb-5 animate-pop">🐾</div>
          <h1 className="text-4xl font-black tracking-tight mb-2">TerryMon</h1>
          <p className="text-white/70 text-base">每一位毛孩的健康燈塔</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-t-3xl px-6 py-8 shadow-xl flex-1 -mt-4">
          <h2 className="text-2xl font-bold text-ink mb-6">歡迎回來</h2>

          <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
            <div>
              <Input
                {...register('email')}
                type="email"
                placeholder="電子信箱"
                className="h-12"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
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
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-t"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold text-base"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : '登入'}
            </Button>
          </form>

          <div className="mt-5 p-4 bg-primary-bg border border-primary/20 rounded-xl">
            <p className="text-xs font-semibold text-primary mb-1">🧪 Demo 帳號</p>
            <p className="text-xs text-slate-t">Email：demo@terrymon.com</p>
            <p className="text-xs text-slate-t">密碼：demo1234</p>
          </div>

          <p className="text-center text-xs text-slate-t mt-6">
            還沒有帳號？
            <button
              onClick={() => { regReset(); setRegisterOpen(true) }}
              className="text-primary font-medium ml-1"
            >
              立即加入
            </button>
          </p>
        </div>
      </div>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>建立會員帳號</DialogTitle>
          </DialogHeader>
          <form onSubmit={regSubmit(onRegister)} className="space-y-3 mt-2">
            <div>
              <label className="text-sm font-medium text-ink block mb-1">姓名 *</label>
              <Input {...regField('name')} placeholder="王小明" disabled={regLoading} />
              {regErrors.name && <p className="text-xs text-red-500 mt-1">{regErrors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">手機號碼 *</label>
              <Input {...regField('phone')} placeholder="0912-345-678" type="tel" disabled={regLoading} />
              {regErrors.phone && <p className="text-xs text-red-500 mt-1">{regErrors.phone.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">電子信箱 *</label>
              <Input {...regField('email')} type="email" placeholder="name@email.com" disabled={regLoading} />
              {regErrors.email && <p className="text-xs text-red-500 mt-1">{regErrors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">密碼 *</label>
              <Input {...regField('password')} type="password" placeholder="至少 6 個字元" disabled={regLoading} />
              {regErrors.password && <p className="text-xs text-red-500 mt-1">{regErrors.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">確認密碼 *</label>
              <Input {...regField('confirmPassword')} type="password" placeholder="再輸入一次密碼" disabled={regLoading} />
              {regErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{regErrors.confirmPassword.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={regLoading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold"
            >
              {regLoading ? <Loader2 size={20} className="animate-spin" /> : '建立帳號'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
