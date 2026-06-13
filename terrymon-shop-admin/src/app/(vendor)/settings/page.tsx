'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type BasicForm = { storeName: string; storeDescription: string; phone: string; email: string }

export default function SettingsPage() {
  const { vendor } = useVendorStore()
  const [tab, setTab] = useState<'basic' | 'financial'>('basic')

  const { register, handleSubmit } = useForm<BasicForm>({
    defaultValues: {
      storeName: vendor?.storeName ?? '',
      storeDescription: vendor?.storeDescription ?? '',
      phone: vendor?.phone ?? '',
      email: vendor?.email ?? '',
    },
  })

  function onSave() { toast.success('設定已儲存') }

  const tabs = [
    { key: 'basic' as const, label: '基本資料' },
    { key: 'financial' as const, label: '金融資訊' },
  ]

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-black text-ink mb-6">商家設定</h1>

      <div className="flex gap-1 bg-surface border border-border-t rounded-xl p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.key ? 'bg-primary text-white' : 'text-slate-t hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="bg-white rounded-2xl border border-border-t p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">店家名稱</label>
              <Input {...register('storeName')} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">店家介紹</label>
              <Textarea {...register('storeDescription')} rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">聯絡電話</label>
              <Input {...register('phone')} />
            </div>
            <div>
              <label className="text-sm font-medium text-ink mb-1 block">電子信箱</label>
              <Input {...register('email')} type="email" />
            </div>
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold w-full h-11">
            儲存設定
          </Button>
        </form>
      )}

      {tab === 'financial' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
            <Lock size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">金融資訊僅供檢視</p>
              <p className="text-xs text-yellow-700 mt-0.5">如需修改，請聯繫客服 support@terrymon.com</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-t p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-t mb-1 block">統一編號</label>
              <div className="h-9 rounded-lg border border-border-t bg-surface px-2.5 flex items-center text-sm font-mono text-ink">
                {vendor?.taxId ?? '—'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-t mb-1 block">銀行帳號</label>
              <div className="h-9 rounded-lg border border-border-t bg-surface px-2.5 flex items-center text-sm font-mono text-ink">
                {vendor?.bankAccount ?? '—'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-t mb-1 block">帳號狀態</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-sm text-green-700 font-medium">已驗證</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
