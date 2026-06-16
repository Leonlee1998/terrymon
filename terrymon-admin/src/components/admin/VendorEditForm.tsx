'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { setVendorStatus, setVendorCommission } from '@/services/adminActions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { VendorStatus } from '@/types'

export default function VendorEditForm({ vendorId, status, commissionRate }: {
  vendorId: string; status: VendorStatus; commissionRate: number
}) {
  const [st, setSt] = useState<VendorStatus>(status)
  const [rate, setRate] = useState(String(commissionRate))
  const [pending, start] = useTransition()

  function save(e: React.FormEvent) {
    e.preventDefault()
    const r = Number(rate)
    if (Number.isNaN(r) || r < 0 || r > 100) { toast.error('抽成需介於 0–100'); return }
    start(async () => {
      const a = await setVendorStatus(vendorId, st)
      const b = await setVendorCommission(vendorId, r)
      if (a.ok && b.ok) toast.success('已更新')
      else toast.error(a.error ?? b.error ?? '更新失敗')
    })
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-slate-t">狀態</label>
        <select
          value={st} onChange={(e) => setSt(e.target.value as VendorStatus)}
          className="h-10 w-full rounded-md border border-border-t bg-white px-3 text-sm"
        >
          <option value="pending">待審</option>
          <option value="approved">已核准</option>
          <option value="suspended">已停權</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-t">抽成 (%)</label>
        <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? '儲存中…' : '儲存'}</Button>
    </form>
  )
}
